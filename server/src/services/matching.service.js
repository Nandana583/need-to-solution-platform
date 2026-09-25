import { Service } from '../models/Service.js';
import { Resource } from '../models/Resource.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { User } from '../models/User.js';

export class MatchingService {
  /**
   * Two-phase matching algorithm for a given Need
   * Phase 1: Search active professional/commercial services & providers
   * Phase 2: Search community fallback solutions (resources, study notes, book lenders, peer sharers)
   */
  static async matchNeed(need) {
    const categoryId = need.category;
    const needKeywords = `${need.title} ${need.description}`.toLowerCase();
    const requesterId = need.requester.toString();

    // -------------------------------------------------------------
    // PHASE 1 — Commercial / Professional Provider Matching
    // -------------------------------------------------------------
    const serviceFilter = {
      category: categoryId,
      isActive: true,
      provider: { $ne: need.requester }, // Exclude self
    };

    const potentialServices = await Service.find(serviceFilter)
      .populate('provider', 'name email phone profileImage location locationLabel')
      .populate('category', 'name slug icon')
      .limit(10);

    const providerMatches = [];

    for (const service of potentialServices) {
      if (!service.provider) continue;

      const profile = await ProviderProfile.findOne({ user: service.provider._id });
      
      // Exclude inactive or strictly unavailable providers from active commercial matches
      if (profile && (!profile.isActive || profile.availabilityStatus === 'UNAVAILABLE')) {
        continue;
      }

      let score = 50; // Base score for exact category match
      const reasons = ['Category Match'];

      // Evaluate explicit capability matching across Service title, description, and ProviderProfile.skills
      const serviceText = `${service.title} ${service.description}`.toLowerCase();
      const providerSkills = (profile?.skills || []).map((s) => s.toLowerCase());

      const reqSkill = (need.requiredSkill || '').toLowerCase().trim();
      const reqService = (need.requiredService || '').toLowerCase().trim();
      
      let hasCapabilityMatch = false;

      // 1. Check requiredService or requiredSkill if explicitly provided on Need
      if (reqService) {
        if (serviceText.includes(reqService) || providerSkills.some((s) => s.includes(reqService) || reqService.includes(s))) {
          score += 30;
          reasons.push(`Listed Service: ${need.requiredService}`);
          hasCapabilityMatch = true;
        }
      }

      if (reqSkill) {
        if (serviceText.includes(reqSkill) || providerSkills.some((s) => s.includes(reqSkill) || reqSkill.includes(s))) {
          score += 20;
          reasons.push(`Listed Skill: ${need.requiredSkill}`);
          hasCapabilityMatch = true;
        }
      }

      // 2. Keyword match in title or description if not already matched
      const words = need.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['need', 'urgent', 'repair', 'service', 'help', 'looking', 'required'].includes(w));
      
      const matchedWords = words.filter(
        (word) => serviceText.includes(word) || providerSkills.some((s) => s.includes(word))
      );

      if (matchedWords.length > 0) {
        score += Math.min(25, matchedWords.length * 10);
        reasons.push(`Capability Match (${matchedWords.slice(0, 3).join(', ')})`);
        hasCapabilityMatch = true;
      }

      // Check provider profile availability status
      if (profile) {
        if (profile.availabilityStatus === 'AVAILABLE_NOW') {
          score += 15;
          reasons.push('Available Now');
        } else if (profile.availabilityStatus === 'BUSY') {
          score += 5;
          reasons.push('Busy (Accepting Queued)');
        }
        if (profile.rating >= 4.5) {
          score += 5;
          reasons.push(`Top Rated (${profile.rating}★)`);
        }
      }

      // Proximity check if coordinates exist on both
      const needCoords = need.location?.coordinates;
      const provCoords = service.provider?.location?.coordinates;
      if (
        needCoords &&
        provCoords &&
        !(needCoords[0] === 0 && needCoords[1] === 0) &&
        !(provCoords[0] === 0 && provCoords[1] === 0)
      ) {
        const distKm = MatchingService.calculateDistanceKm(
          needCoords[1],
          needCoords[0],
          provCoords[1],
          provCoords[0]
        );
        if (distKm <= 15) {
          score += 15;
          reasons.push(`Nearby (${distKm.toFixed(1)} km)`);
        } else if (distKm <= 50) {
          score += 5;
          reasons.push(`In Region (${distKm.toFixed(1)} km)`);
        }
      } else if (need.locationLabel && service.locationLabel) {
        if (
          need.locationLabel.toLowerCase().includes(service.locationLabel.toLowerCase()) ||
          service.locationLabel.toLowerCase().includes(need.locationLabel.toLowerCase())
        ) {
          score += 10;
          reasons.push(`Area match: ${service.locationLabel}`);
        }
      }

      providerMatches.push({
        provider: service.provider,
        service: service,
        profile: profile || null,
        matchScore: Math.min(100, score),
        matchReason: reasons.join(' • '),
        solutionType: 'PROFESSIONAL_PROVIDER',
      });
    }

    // Sort Phase 1 matches by score descending
    providerMatches.sort((a, b) => b.matchScore - a.matchScore);

    // -------------------------------------------------------------
    // PHASE 2 — Fallback Community Solution Matching
    // Triggered when:
    // a) Few or low-scoring commercial providers found, OR
    // b) Need is resource/study material related, OR
    // c) User requested community solutions
    // -------------------------------------------------------------
    const resourceFilter = {
      category: categoryId,
      isActive: true,
      availabilityStatus: { $in: ['AVAILABLE', 'SHARED'] },
      owner: { $ne: need.requester }, // Exclude self
    };

    const potentialResources = await Resource.find(resourceFilter)
      .populate('owner', 'name email phone profileImage location locationLabel')
      .populate('category', 'name slug icon')
      .limit(10);

    const communityMatches = [];

    for (const res of potentialResources) {
      if (!res.owner) continue;

      let score = 50; // Base score for category
      const reasons = ['Community Solution'];

      const resText = `${res.title} ${res.description} ${res.metadata?.author || ''} ${
        res.metadata?.subject || ''
      }`.toLowerCase();

      const words = need.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const matchedWords = words.filter((word) => resText.includes(word));

      if (matchedWords.length > 0) {
        score += Math.min(35, matchedWords.length * 15);
        reasons.push(`Matching resource: "${res.title}"`);
      }

      if (res.shareType === 'LEND') {
        reasons.push('Available to borrow');
      } else if (res.shareType === 'GIVEAWAY') {
        reasons.push('Offered as free giveaway');
      } else if (res.shareType === 'PHOTOCOPY_SHARE' || res.shareType === 'DIGITAL_SHARE') {
        reasons.push('Study copies/notes available');
      }

      communityMatches.push({
        resource: res,
        owner: res.owner,
        matchScore: Math.min(100, score),
        matchReason: reasons.join(' • '),
        solutionType: 'COMMUNITY_FALLBACK',
        isFallback: true,
      });
    }

    communityMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Store matches back into Need document for fast retrieval
    need.matchedProviders = providerMatches.map((m) => ({
      provider: m.provider._id,
      service: m.service._id,
      matchScore: m.matchScore,
      matchReason: m.matchReason,
    }));

    need.matchedResources = communityMatches.map((m) => ({
      resource: m.resource._id,
      owner: m.owner._id,
      matchScore: m.matchScore,
      matchReason: m.matchReason,
    }));

    if (need.status === 'CREATED') {
      need.status = 'MATCHING';
    }

    await need.save();

    return {
      needId: need._id,
      phase1Providers: providerMatches,
      phase2Fallbacks: communityMatches,
      hasCommercialSolution: providerMatches.length > 0,
      hasCommunitySolution: communityMatches.length > 0,
      fallbackActivated: providerMatches.length === 0 && communityMatches.length > 0,
    };
  }

  static calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
