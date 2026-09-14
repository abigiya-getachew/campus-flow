import mongoose from "mongoose";

/**
 * Stores revoked JWT IDs so that logged-out tokens can no longer be used,
 * even while they are technically still within their expiry window.
 *
 * The `expiresAt` field drives a MongoDB TTL index so documents are deleted
 * automatically once the token would have expired anyway — keeping the
 * collection lean without any manual cleanup.
 */
const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB will automatically delete documents after their `expiresAt` time.
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);
