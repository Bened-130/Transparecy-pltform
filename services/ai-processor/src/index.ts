import Fastify from 'fastify';
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import Sharp from 'sharp';
import dotenv from 'dotenv';
import pino from 'pino';
import { Pool } from 'pg';
import { broadcastUpdate } from '../../../services/api-gateway/src/routes/websocket';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const fastify = Fastify({ logger });

// Initialize AWS Textract
const textract = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Initialize Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==================== CORE PROCESSING ====================

export interface AggregatedTally {
  [candidateName: string]: {
    votes: number;
    party?: string;
  };
}

export async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Use AWS Textract for OCR
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: imageBuffer,
      },
      FeatureTypes: ['TABLES', 'FORMS'],
    });

    const response = await textract.send(command);
    const blocks = response.Blocks || [];

    // Extract all text
    const text = blocks
      .filter((block) => block.BlockType === 'LINE')
      .map((block) => block.Text)
      .join('\n');

    return text;
  } catch (error) {
    logger.error('Text extraction error:', error);
    throw error;
  }
}

export function parseTallyResults(
  extractedText: string,
  candidates: any[]
): {
  tallies: AggregatedTally;
  confidence: number;
  isValid: boolean;
} {
  const tallies: AggregatedTally = {};
  let foundCandidates = 0;
  const textUpper = extractedText.toUpperCase();

  // Initialize with candidate names
  candidates.forEach((candidate) => {
    tallies[candidate.name] = { votes: 0, party: candidate.party };
  });

  // Parse vote counts using regex patterns
  const numberPattern = /(\d+)/g;
  const matches = extractedText.match(numberPattern) || [];

  // Heuristic: Look for numbers in context of candidate names
  let confidence = 0.0;
  candidates.forEach((candidate) => {
    const candidatePattern = new RegExp(`${candidate.name}[\\s:]*([0-9]+)`, 'i');
    const match = extractedText.match(candidatePattern);

    if (match) {
      const votes = parseInt(match[1]);
      if (votes >= 0 && votes <= 100000) {
        tallies[candidate.name].votes = votes;
        foundCandidates++;
        confidence += 0.25;
      }
    }
  });

  confidence = Math.min(confidence, 1.0);
  const isValid = foundCandidates === candidates.length && confidence > 0.5;

  return { tallies, confidence, isValid };
}

export async function detectAnomalies(
  tallies: AggregatedTally,
  historicalData?: any
): Promise<{
  flagged: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];
  let totalVotes = 0;

  Object.values(tallies).forEach((result) => {
    totalVotes += result.votes;
  });

  // Check for suspicious patterns
  if (totalVotes === 0) {
    reasons.push('No votes recorded');
  }

  if (totalVotes > 100000) {
    reasons.push('Unusually high vote count');
  }

  // Check for identical vote counts
  const votes = Object.values(tallies).map((t) => t.votes);
  if (new Set(votes).size === 1 && votes[0] > 0) {
    reasons.push('All candidates have identical vote counts');
  }

  return {
    flagged: reasons.length > 0,
    reasons,
  };
}

// ==================== ROUTES ====================

fastify.get('/health', async () => {
  return { status: 'ok', service: 'ai-processor' };
});

fastify.post<{ Body: any }>('/process', async (request, reply) => {
  try {
    const { uploadId, images, metadata } = request.body;

    // Update status
    await pool.query(
      `UPDATE uploads SET status = 'processing', updated_at = NOW() WHERE id = $1`,
      [uploadId]
    );

    logger.info(`Processing upload ${uploadId}`);

    // Process first image (main tally sheet)
    const primaryImage = images[0];
    const extractedText = await extractTextFromImage(primaryImage.base64);

    // Get election and candidates info
    const electionResult = await pool.query(
      `SELECT e.id, c.* FROM uploads u
       JOIN elections e ON u.election_id = e.id
       JOIN candidates c ON e.id = c.election_id
       WHERE u.id = $1`,
      [uploadId]
    );

    if (electionResult.rows.length === 0) {
      throw new Error('Could not find election data');
    }

    const candidates = electionResult.rows;
    const electionId = candidates[0].election_id;

    // Parse results
    const { tallies, confidence, isValid } = parseTallyResults(extractedText, candidates);

    // Detect anomalies
    const { flagged, reasons } = await detectAnomalies(tallies);

    // Store processing results
    await pool.query(
      `INSERT INTO processing_results (upload_id, extracted_text, confidence_score, flagged_for_review)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (upload_id) DO UPDATE SET 
         extracted_text = $2, confidence_score = $3, flagged_for_review = $4`,
      [uploadId, extractedText, confidence, flagged]
    );

    // Store tallies in database
    const uploadRow = await pool.query(
      `SELECT polling_station_id FROM uploads WHERE id = $1`,
      [uploadId]
    );

    const pollingStationId = uploadRow.rows[0].polling_station_id;

    for (const candidate of candidates) {
      const votes = tallies[candidate.name]?.votes || 0;

      await pool.query(
        `INSERT INTO tallies (
          election_id, polling_station_id, upload_id, candidate_id,
          votes, valid_votes, invalid_votes, verification_status
        ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7)`,
        [
          electionId,
          pollingStationId,
          uploadId,
          candidate.id,
          votes,
          0,
          isValid && !flagged ? 'verified' : 'unverified',
        ]
      );
    }

    // Update upload status
    const finalStatus = isValid && !flagged ? 'verified' : flagged ? 'pending' : 'failed';
    await pool.query(
      `UPDATE uploads SET status = $1, updated_at = NOW() WHERE id = $2`,
      [finalStatus, uploadId]
    );

    // Broadcast update via WebSocket
    try {
      broadcastUpdate(electionId, pollingStationId, {
        type: 'upload-status',
        data: {
          uploadId,
          status: finalStatus,
          confidence,
          flagged,
          reasons,
        },
      });
    } catch (err) {
      logger.warn('Could not broadcast WebSocket update');
    }

    logger.info(`✓ Processing complete for upload ${uploadId}: ${finalStatus}`);

    reply.status(200).send({
      uploadId,
      status: finalStatus,
      confidence,
      flagged,
      reasons,
      tallies,
    });
  } catch (error: any) {
    logger.error('Processing error:', error);

    // Update upload status to failed
    if (request.body?.uploadId) {
      await pool.query(
        `UPDATE uploads SET status = 'failed', failure_reason = $1, updated_at = NOW() WHERE id = $2`,
        [error.message, request.body.uploadId]
      );
    }

    reply.status(500).send({
      error: error.message || 'Processing failed',
    });
  }
});

// ==================== START SERVER ====================

const start = async () => {
  try {
    await pool.connect();
    await fastify.listen({ port: parseInt(process.env.PORT || '3001'), host: '0.0.0.0' });
    logger.info(`AI Processor running at http://0.0.0.0:${process.env.PORT || 3001}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
