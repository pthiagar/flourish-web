const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SubscriberManager {
  constructor(dataFilePath = null) {
    this.dataFilePath = dataFilePath || path.join(__dirname, 'data', 'subscribers.json');
    this.legacyFilePath = path.join(__dirname, 'subscribers.json');
    this.subscribers = [];
    this.init();
  }

  init() {
    try {
      // 1. Check primary data/subscribers.json
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.subscribers = this.normalizeSubscribers(parsed);
        return;
      }

      // 2. Fallback check for legacy root subscribers.json
      if (fs.existsSync(this.legacyFilePath)) {
        const raw = fs.readFileSync(this.legacyFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.subscribers = this.normalizeSubscribers(parsed);
        this.save();
        return;
      }

      // 3. Initialize empty
      this.subscribers = [];
      this.save();
    } catch (err) {
      console.warn('⚠️ [SubscriberManager] Error initializing subscribers from disk:', err.message);
      this.subscribers = [];
    }
  }

  normalizeSubscribers(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => {
      if (typeof item === 'string') {
        return {
          email: item.toLowerCase().trim(),
          status: 'active',
          subscribedAt: new Date().toISOString(),
          lastSentMonth: null,
          unsubscribeToken: this.generateToken(item)
        };
      }
      return {
        email: (item.email || '').toLowerCase().trim(),
        status: item.status || 'active',
        subscribedAt: item.subscribedAt || new Date().toISOString(),
        lastSentMonth: item.lastSentMonth || null,
        unsubscribeToken: item.unsubscribeToken || this.generateToken(item.email)
      };
    });
  }

  generateToken(email) {
    return crypto.createHash('sha256').update((email || '') + '-flourish-salt-' + Math.random()).digest('hex').slice(0, 32);
  }

  save() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.subscribers, null, 2), 'utf8');
    } catch (err) {
      console.warn('⚠️ [SubscriberManager] Unable to persist subscribers to disk (normal in read-only serverless):', err.message);
    }
  }

  addSubscriber(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Valid email address required');
    }

    let existing = this.subscribers.find(s => s.email === cleanEmail);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.unsubscribedAt = null;
        this.save();
        return { subscriber: existing, isNew: false, reactivated: true };
      }
      return { subscriber: existing, isNew: false, reactivated: false };
    }

    const newSub = {
      email: cleanEmail,
      status: 'active',
      subscribedAt: new Date().toISOString(),
      lastSentMonth: null,
      unsubscribeToken: this.generateToken(cleanEmail)
    };

    this.subscribers.push(newSub);
    this.save();
    return { subscriber: newSub, isNew: true, reactivated: false };
  }

  getEligibleSubscribersForMonth(monthKey) {
    return this.subscribers.filter(s => s.status === 'active' && s.lastSentMonth !== monthKey);
  }

  recordMonthSent(email, monthKey) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const sub = this.subscribers.find(s => s.email === cleanEmail);
    if (sub) {
      sub.lastSentMonth = monthKey;
      sub.lastSentAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  unsubscribe(tokenOrEmail) {
    if (!tokenOrEmail) return { success: false, message: 'Invalid token or email' };
    const clean = tokenOrEmail.trim().toLowerCase();

    const sub = this.subscribers.find(s => s.unsubscribeToken === tokenOrEmail || s.email === clean);
    if (!sub) {
      return { success: false, message: 'Subscriber not found' };
    }

    sub.status = 'unsubscribed';
    sub.unsubscribedAt = new Date().toISOString();
    this.save();
    return { success: true, email: sub.email };
  }

  getSubscriberByToken(token) {
    return this.subscribers.find(s => s.unsubscribeToken === token);
  }

  getAllSubscribers() {
    return [...this.subscribers];
  }

  getActiveCount() {
    return this.subscribers.filter(s => s.status === 'active').length;
  }
}

module.exports = new SubscriberManager();
