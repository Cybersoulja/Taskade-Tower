
const Cloudflare = require('cloudflare');

class CloudflareService {
  constructor() {
    if (!process.env.CLOUDFLARE_API_KEY) {
      throw new Error('CLOUDFLARE_API_KEY environment variable is not set');
    }
    
    this.cf = new Cloudflare({
      email: process.env.CLOUDFLARE_EMAIL,
      key: process.env.CLOUDFLARE_API_KEY
    });
  }

  // Get all zones (domains)
  async getZones() {
    try {
      const zones = await this.cf.zones.browse();
      return zones.result;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  }

  // Get zone details by ID
  async getZone(zoneId) {
    try {
      const zone = await this.cf.zones.read(zoneId);
      return zone.result;
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  }

  // Get DNS records for a zone
  async getDNSRecords(zoneId, type = null, name = null) {
    try {
      const params = { zone: zoneId };
      if (type) params.type = type;
      if (name) params.name = name;
      
      const records = await this.cf.dnsRecords.browse(zoneId, params);
      return records.result;
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      throw error;
    }
  }

  // Create a DNS record
  async createDNSRecord(zoneId, recordData) {
    try {
      const record = await this.cf.dnsRecords.add(zoneId, recordData);
      return record.result;
    } catch (error) {
      console.error('Error creating DNS record:', error);
      throw error;
    }
  }

  // Update a DNS record
  async updateDNSRecord(zoneId, recordId, recordData) {
    try {
      const record = await this.cf.dnsRecords.edit(zoneId, recordId, recordData);
      return record.result;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw error;
    }
  }

  // Delete a DNS record
  async deleteDNSRecord(zoneId, recordId) {
    try {
      const result = await this.cf.dnsRecords.del(zoneId, recordId);
      return result.result;
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      throw error;
    }
  }

  // Purge cache for entire zone
  async purgeCache(zoneId, files = null) {
    try {
      const data = files ? { files } : { purge_everything: true };
      const result = await this.cf.zones.purgeCache(zoneId, data);
      return result.result;
    } catch (error) {
      console.error('Error purging cache:', error);
      throw error;
    }
  }

  // Get zone analytics
  async getAnalytics(zoneId, since = null, until = null) {
    try {
      const params = {};
      if (since) params.since = since;
      if (until) params.until = until;
      
      const analytics = await this.cf.zones.analytics.dashboard(zoneId, params);
      return analytics.result;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get security settings
  async getSecuritySettings(zoneId) {
    try {
      const settings = await this.cf.zones.settings.browse(zoneId);
      return settings.result;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  // Update security level
  async updateSecurityLevel(zoneId, level) {
    try {
      const result = await this.cf.zones.settings.edit(zoneId, 'security_level', { value: level });
      return result.result;
    } catch (error) {
      console.error('Error updating security level:', error);
      throw error;
    }
  }

  // Get SSL settings
  async getSSLSettings(zoneId) {
    try {
      const ssl = await this.cf.zones.settings.read(zoneId, 'ssl');
      return ssl.result;
    } catch (error) {
      console.error('Error fetching SSL settings:', error);
      throw error;
    }
  }

  // Update SSL mode
  async updateSSLMode(zoneId, mode) {
    try {
      const result = await this.cf.zones.settings.edit(zoneId, 'ssl', { value: mode });
      return result.result;
    } catch (error) {
      console.error('Error updating SSL mode:', error);
      throw error;
    }
  }
}

module.exports = CloudflareService;
