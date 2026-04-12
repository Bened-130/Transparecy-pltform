import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OTPRequestSchema, OTPVerifySchema } from '@iebc/shared-types';
import { pool } from '../services/database';
import { sendOTP } from '../services/sms';
import crypto from 'crypto';

export async function otpRoutes(fastify: FastifyInstance) {
  // Generate and send OTP
  fastify.post<{ Body: any }>(
    '/request-otp',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = OTPRequestSchema.parse(request.body);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database
        await pool.query(
          `INSERT INTO otp_attempts (phone_number, election_id, otp_code)
           VALUES ($1, $2, $3)`,
          [data.phoneNumber, data.electionId, otp]
        );

        // Send OTP via SMS (implement SMS service separately)
        await sendOTP(data.phoneNumber, otp);

        reply.status(200).send({
          message: 'OTP sent successfully',
          phoneNumber: data.phoneNumber,
        });
      } catch (error: any) {
        reply.status(400).send({
          error: error.message || 'Failed to request OTP',
        });
      }
    }
  );

  // Verify OTP and generate token
  fastify.post<{ Body: any }>(
    '/verify-otp',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = OTPVerifySchema.parse(request.body);

        // Check OTP in database
        const result = await pool.query(
          `SELECT * FROM otp_attempts 
           WHERE phone_number = $1 AND election_id = $2 AND is_used = FALSE AND expires_at > NOW()
           ORDER BY created_at DESC LIMIT 1`,
          [data.phoneNumber, data.electionId]
        );

        if (result.rows.length === 0) {
          return reply.status(401).send({
            error: 'Invalid or expired OTP',
          });
        }

        const otpRecord = result.rows[0];

        if (otpRecord.otp_code !== data.otpCode) {
          // Increment attempt count
          await pool.query(
            `UPDATE otp_attempts SET attempt_count = attempt_count + 1 WHERE id = $1`,
            [otpRecord.id]
          );

          return reply.status(401).send({
            error: 'Incorrect OTP',
          });
        }

        // Mark OTP as used
        await pool.query(`UPDATE otp_attempts SET is_used = TRUE WHERE id = $1`, [otpRecord.id]);

        // Get or create user
        const userResult = await pool.query(
          `SELECT * FROM users WHERE phone_number = $1`,
          [data.phoneNumber]
        );

        let userId: string;
        if (userResult.rows.length === 0) {
          const newUserResult = await pool.query(
            `INSERT INTO users (phone_number, role) VALUES ($1, $2) RETURNING id`,
            [data.phoneNumber, 'viewer']
          );
          userId = newUserResult.rows[0].id;
        } else {
          userId = userResult.rows[0].id;
        }

        // Generate JWT token
        const token = fastify.jwt.sign(
          {
            userId,
            phoneNumber: data.phoneNumber,
            electionId: data.electionId,
          },
          { expiresIn: '24h' }
        );

        const refreshToken = fastify.jwt.sign(
          {
            userId,
            phoneNumber: data.phoneNumber,
            type: 'refresh',
          },
          { expiresIn: '7d' }
        );

        reply.status(200).send({
          token,
          refreshToken,
          expiresIn: 86400,
          userId,
        });
      } catch (error: any) {
        reply.status(400).send({
          error: error.message || 'Failed to verify OTP',
        });
      }
    }
  );

  // Refresh token
  fastify.post('/refresh-token', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user;

      const token = fastify.jwt.sign(
        {
          userId: payload.userId,
          phoneNumber: payload.phoneNumber,
          electionId: payload.electionId,
        },
        { expiresIn: '24h' }
      );

      reply.status(200).send({
        token,
        expiresIn: 86400,
      });
    } catch (error) {
      reply.status(401).send({
        error: 'Invalid refresh token',
      });
    }
  });
}
