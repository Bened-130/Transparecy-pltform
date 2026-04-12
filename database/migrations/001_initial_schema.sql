-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== ENUMS ====================
CREATE TYPE election_state AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE user_role AS ENUM ('admin', 'observer', 'clerk', 'viewer');
CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'verified', 'failed', 'rejected');
CREATE TYPE verification_status AS ENUM ('unverified', 'verified', 'disputed', 'rejected');

-- ==================== USERS ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);

-- ==================== OTP MANAGEMENT ====================
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  election_id UUID NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

CREATE INDEX idx_otp_phone_election ON otp_attempts(phone_number, election_id);
CREATE INDEX idx_otp_expires ON otp_attempts(expires_at);

-- ==================== ELECTIONS ====================
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  state election_state NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_polling_stations INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_elections_state ON elections(state);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);

-- ==================== COUNTIES & CONSTITUENCIES ====================
CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE constituencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_counties_election ON counties(election_id);
CREATE INDEX idx_constituencies_election ON constituencies(election_id);
CREATE INDEX idx_constituencies_county ON constituencies(county_id);

-- ==================== CANDIDATES ====================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_election ON candidates(election_id);

-- ==================== POLLING STATIONS ====================
CREATE TABLE polling_stations (
  id VARCHAR(50) PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  total_voters INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_polling_station_election ON polling_stations(election_id);
CREATE INDEX idx_polling_station_county ON polling_stations(county_id);
CREATE INDEX idx_polling_station_constituency ON polling_stations(constituency_id);

-- ==================== UPLOADS ====================
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  polling_station_id VARCHAR(50) NOT NULL REFERENCES polling_stations(id),
  uploader_id UUID NOT NULL REFERENCES users(id),
  image_count INT NOT NULL,
  status upload_status NOT NULL DEFAULT 'pending',
  ipfs_hash VARCHAR(255),
  blockchain_tx_hash VARCHAR(255),
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_uploads_election ON uploads(election_id);
CREATE INDEX idx_uploads_polling_station ON uploads(polling_station_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_uploader ON uploads(uploader_id);
CREATE INDEX idx_uploads_created ON uploads(created_at DESC);

-- ==================== UPLOAD IMAGES ====================
CREATE TABLE upload_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  size INT NOT NULL,
  ipfs_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_upload_images_upload ON upload_images(upload_id);

-- ==================== PROCESSING RESULTS ====================
CREATE TABLE processing_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL UNIQUE REFERENCES uploads(id) ON DELETE CASCADE,
  extracted_text TEXT,
  confidence_score DECIMAL(5, 2),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_results_upload ON processing_results(upload_id);

-- ==================== TALLIES ====================
CREATE TABLE tallies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  polling_station_id VARCHAR(50) NOT NULL REFERENCES polling_stations(id),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  votes INT NOT NULL DEFAULT 0,
  valid_votes INT NOT NULL DEFAULT 0,
  invalid_votes INT NOT NULL DEFAULT 0,
  rejected_votes INT NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tallies_election ON tallies(election_id);
CREATE INDEX idx_tallies_polling_station ON tallies(polling_station_id);
CREATE INDEX idx_tallies_candidate ON tallies(candidate_id);
CREATE INDEX idx_tallies_upload ON tallies(upload_id);
CREATE INDEX idx_tallies_status ON tallies(verification_status);

-- ==================== AUDIT LOG ====================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==================== FUNCTIONS ====================
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_attempts WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_polling_stations_updated_at BEFORE UPDATE ON polling_stations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tallies_updated_at BEFORE UPDATE ON tallies
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_processing_results_updated_at BEFORE UPDATE ON processing_results
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
