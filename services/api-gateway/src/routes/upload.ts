import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ElectionDataUploadSchema, UploadRecordSchema } from '@iebc/shared-types';
import { pool } from '../services/database';
import axios from 'axios';
import crypto from 'crypto';

export async function uploadRoutes(fastify: FastifyInstance) {
  // Upload election data (images + metadata)
  fastify.post<{ Body: any }>(
    '/election-data',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();

        const data = ElectionDataUploadSchema.parse(request.body);
        const userId = (request.user as any).userId;

        // Create upload record
        const uploadResult = await pool.query(
          `INSERT INTO uploads (election_id, polling_station_id, uploader_id, image_count, status)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [data.electionId, data.pollingStationId, userId, data.images.length, 'pending']
        );

        const uploadId = uploadResult.rows[0].id;

        // Store images
        for (const image of data.images) {
          await pool.query(
            `INSERT INTO upload_images (upload_id, filename, mime_type, size)
             VALUES ($1, $2, $3, $4)`,
            [uploadId, image.filename, image.mimeType, image.size]
          );
        }

        // Trigger AI processing via message queue/async job
        // For now, we'll update status to processing
        await pool.query(
          `UPDATE uploads SET status = 'processing' WHERE id = $1`,
          [uploadId]
        );

        // Send to AI Processor service
        try {
          await axios.post(
            `${process.env.AI_PROCESSOR_URL || 'http://localhost:3001'}/process`,
            {
              uploadId,
              images: data.images,
              metadata: data.metadata,
            },
            { timeout: 5000 }
          );
        } catch (error) {
          fastify.logger.warn('Failed to send to AI processor, will retry later');
        }

        reply.status(201).send({
          uploadId,
          status: 'processing',
          message: 'Upload received and queued for processing',
        });
      } catch (error: any) {
        reply.status(400).send({
          error: error.message || 'Failed to upload election data',
        });
      }
    }
  );

  // Get upload status
  fastify.get<{ Params: { uploadId: string } }>(
    '/:uploadId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { uploadId } = request.params;

        const result = await pool.query(
          `SELECT u.*, pr.extracted_text, pr.confidence_score, pr.flagged_for_review
           FROM uploads u
           LEFT JOIN processing_results pr ON u.id = pr.upload_id
           WHERE u.id = $1`,
          [uploadId]
        );

        if (result.rows.length === 0) {
          return reply.status(404).send({
            error: 'Upload not found',
          });
        }

        const upload = result.rows[0];

        // Get tallies if processed
        let tallies = [];
        if (upload.status === 'verified') {
          const talliesResult = await pool.query(
            `SELECT t.*, c.name as candidate_name, c.party
             FROM tallies t
             JOIN candidates c ON t.candidate_id = c.id
             WHERE t.upload_id = $1`,
            [uploadId]
          );
          tallies = talliesResult.rows;
        }

        reply.status(200).send({
          id: upload.id,
          status: upload.status,
          imageCount: upload.image_count,
          createdAt: upload.created_at,
          updatedAt: upload.updated_at,
          processingResult: {
            extractedText: upload.extracted_text,
            confidenceScore: upload.confidence_score,
            flaggedForReview: upload.flagged_for_review,
          },
          tallies,
          failureReason: upload.failure_reason,
        });
      } catch (error: any) {
        reply.status(500).send({
          error: error.message || 'Failed to fetch upload status',
        });
      }
    }
  );

  // Get recent uploads for a polling station
  fastify.get<{ Params: { pollingStationId: string } }>(
    '/polling-station/:pollingStationId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { pollingStationId } = request.params;
        const limit = Math.min(parseInt((request.query as any).limit) || 10, 100);

        const result = await pool.query(
          `SELECT * FROM uploads 
           WHERE polling_station_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [pollingStationId, limit]
        );

        reply.status(200).send({
          uploads: result.rows,
          count: result.rows.length,
        });
      } catch (error: any) {
        reply.status(500).send({
          error: error.message || 'Failed to fetch uploads',
        });
      }
    }
  );

  // Verify/reject upload (admin only)
  fastify.patch<{ Params: { uploadId: string }; Body: any }>(
    '/:uploadId/verify',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const userId = (request.user as any).userId;

        // Check if user is admin
        const userResult = await pool.query(`SELECT role FROM users WHERE id = $1`, [userId]);
        if (userResult.rows[0].role !== 'admin' && userResult.rows[0].role !== 'observer') {
          return reply.status(403).send({
            error: 'Not authorized',
          });
        }

        const { uploadId } = request.params;
        const { status, notes } = request.body;

        if (!['verified', 'rejected'].includes(status)) {
          return reply.status(400).send({
            error: 'Invalid status',
          });
        }

        // Update upload status
        await pool.query(
          `UPDATE uploads SET status = $1, updated_at = NOW() WHERE id = $2`,
          [status, uploadId]
        );

        // If rejected, store reason
        if (status === 'rejected') {
          await pool.query(
            `UPDATE uploads SET failure_reason = $1 WHERE id = $2`,
            [notes || 'Rejected by admin', uploadId]
          );
        }

        // Audit log
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            `${status}_upload`,
            'upload',
            uploadId,
            JSON.stringify({ status, notes }),
          ]
        );

        reply.status(200).send({
          message: `Upload ${status}`,
          uploadId,
        });
      } catch (error: any) {
        reply.status(500).send({
          error: error.message || 'Failed to verify upload',
        });
      }
    }
  );
}
