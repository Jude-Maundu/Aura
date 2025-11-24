// services/musicService.js
import dotenv from "dotenv";
dotenv.config();

import ai from "../utils/aiClient.js";
import SpotifyWebApi from "spotify-web-api-node";

// Setup Spotify client (only used when spotifyTrackId is provided)
const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let spotifyToken = null;

async function ensureSpotifyToken() {
  if (
    spotifyToken &&
    Date.now() < spotifyToken.expires_at - 60_000 // renew 1 min early
  ) {
    return;
  }

  const data = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(data.body.access_token);

  spotifyToken = {
    token: data.body.access_token,
    expires_at: Date.now() + data.body.expires_in * 1000,
  };
}

/**
 * 🎵 1. Spotify AI — use audio features (valence, energy, danceability)
 */
export async function inferFromSpotifyTrack(trackId) {
  await ensureSpotifyToken();

  const features = (await spotify.getAudioFeaturesForTrack(trackId)).body;

  // Convert Spotify valence + energy to -1..1 scale
  const score =
    ((features.valence - 0.5) * 2) * 0.7 +
    ((features.energy - 0.5) * 2) * 0.25 +
    ((features.danceability - 0.5) * 2) * 0.05;

  return {
    provider: "spotify",
    score,
    features,
  };
}

/**
 * 🎶 2. Track metadata fallback (for custom audio analysis)
 */
export function inferFromTrackMeta(trackMeta = {}) {
  const valence = trackMeta.valence ?? 0.5;
  const energy = trackMeta.energy ?? 0.5;
  const dance = trackMeta.danceability ?? 0.5;

  const score =
    ((valence - 0.5) * 2) * 0.7 +
    ((energy - 0.5) * 2) * 0.25 +
    ((dance - 0.5) * 2) * 0.05;

  return {
    provider: "track-meta",
    score,
    raw: trackMeta,
  };
}

/**
 * 🎧 3. OPTIONAL: HuggingFace raw audio model
 * (Add later if you want to upload real audio files)
 */
export async function inferFromAudioBuffer(buffer) {
  return {
    provider: "audio-fallback",
    score: 0,
    raw: buffer,
    note: "Audio model not implemented yet",
  };
}
