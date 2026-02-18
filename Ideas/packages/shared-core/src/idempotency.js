export class IdempotencyStore {
  constructor() {
    this._keys = new Map();
  }

  claim(key, ttlMs = 60 * 60 * 1000) {
    const now = Date.now();
    const existing = this._keys.get(key);
    if (existing && existing.expiresAt > now) {
      return false;
    }

    this._keys.set(key, { expiresAt: now + ttlMs });
    return true;
  }

  sweep() {
    const now = Date.now();
    for (const [key, value] of this._keys.entries()) {
      if (value.expiresAt <= now) {
        this._keys.delete(key);
      }
    }
  }
}
