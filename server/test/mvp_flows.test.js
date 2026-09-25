import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { Category } from '../src/models/Category.js';
import { ProviderProfile } from '../src/models/ProviderProfile.js';
import { Service } from '../src/models/Service.js';
import { Resource } from '../src/models/Resource.js';
import { Need } from '../src/models/Need.js';
import { Booking } from '../src/models/Booking.js';
import { ShareRequest } from '../src/models/ShareRequest.js';
import { Notification } from '../src/models/Notification.js';
import { Review } from '../src/models/Review.js';
import { config } from '../src/config/env.js';
import { AuthService } from '../src/services/auth.service.js';
import { CategoryService } from '../src/services/category.service.js';

let app;
let server;
let baseUrl;

// Test accounts tokens & IDs
let user1Token, user1Id; // Provider
let user2Token, user2Id; // Requester
let user3Token, user3Id; // Resource owner
let user4Token, user4Id; // Student requester
let adminToken;
let repairCategory, studyCategory;

test.before(async () => {
  await mongoose.connect(config.mongodbUri);

  // Clean test data
  await User.deleteMany({ email: /test.*@mvp\.com/ });
  await User.deleteMany({ email: 'admin@needtosolution.com' });
  await RefreshToken.deleteMany({});
  await ProviderProfile.deleteMany({});
  await Service.deleteMany({});
  await Resource.deleteMany({});
  await Need.deleteMany({});
  await Booking.deleteMany({});
  await ShareRequest.deleteMany({});
  await Notification.deleteMany({});
  await Review.deleteMany({});

  await AuthService.seedAdmin();
  await CategoryService.seedCategories();

  app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany({ email: /test.*@mvp\.com/ });
  await RefreshToken.deleteMany({});
  await ProviderProfile.deleteMany({});
  await Service.deleteMany({});
  await Resource.deleteMany({});
  await Need.deleteMany({});
  await Booking.deleteMany({});
  await ShareRequest.deleteMany({});
  await Notification.deleteMany({});
  await Review.deleteMany({});
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test('1. CATEGORIES - Default categories are seeded and queryable', async () => {
  const res = await fetch(`${baseUrl}/api/v1/categories`);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.categories.length >= 7);

  repairCategory = data.categories.find((c) => c.slug === 'home-appliance-repair');
  studyCategory = data.categories.find((c) => c.slug === 'books-study-materials');
  assert.ok(repairCategory);
  assert.ok(studyCategory);
});

test('2. AUTH SETUP - Register 4 test users (Provider, Requester, Resource Owner, Student)', async () => {
  // User 1: Electrician / Provider
  const res1 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Electrician',
      email: 'testbob@mvp.com',
      password: 'Password123',
      phone: '1234567890',
    }),
  });
  const data1 = await res1.json();
  assert.equal(res1.status, 201);
  user1Token = data1.accessToken;
  user1Id = data1.user.id;

  // User 2: Home Owner / Requester
  const res2 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Homeowner',
      email: 'testalice@mvp.com',
      password: 'Password123',
      phone: '1234567891',
    }),
  });
  const data2 = await res2.json();
  assert.equal(res2.status, 201);
  user2Token = data2.accessToken;
  user2Id = data2.user.id;

  // User 3: Senior Student / Resource Owner
  const res3 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Charlie Student',
      email: 'testcharlie@mvp.com',
      password: 'Password123',
      phone: '1234567892',
    }),
  });
  const data3 = await res3.json();
  assert.equal(res3.status, 201);
  user3Token = data3.accessToken;
  user3Id = data3.user.id;

  // User 4: Junior Student / Requester
  const res4 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'David Junior',
      email: 'testdavid@mvp.com',
      password: 'Password123',
      phone: '1234567893',
    }),
  });
  const data4 = await res4.json();
  assert.equal(res4.status, 201);
  user4Token = data4.accessToken;
  user4Id = data4.user.id;

  // Admin login
  const resAdmin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@needtosolution.com',
      password: 'AdminPassword@123',
    }),
  });
  const dataAdmin = await resAdmin.json();
  assert.equal(resAdmin.status, 200);
  adminToken = dataAdmin.accessToken;
});

test('3. PROVIDER & SERVICE - User 1 enables provider capability and lists Fan Repair service', async () => {
  // Enable provider capability
  const enableRes = await fetch(`${baseUrl}/api/v1/providers/enable-capability`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const enableData = await enableRes.json();
  assert.equal(enableRes.status, 200);
  assert.ok(enableData.user.roles.includes('provider'));

  // Update provider profile
  const profileRes = await fetch(`${baseUrl}/api/v1/providers/profile/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      bio: 'Certified electrician with 8 years of home appliance and fan repair experience.',
      skills: ['Ceiling Fan Repair', 'Wiring', 'AC Service', 'Circuit Breakers'],
      categories: [repairCategory._id],
      experienceYears: 8,
      serviceArea: 'Downtown & Suburbs',
      availabilityStatus: 'AVAILABLE_NOW',
    }),
  });
  const profileData = await profileRes.json();
  assert.equal(profileRes.status, 200);
  assert.equal(profileData.profile.experienceYears, 8);

  // Create Service
  const serviceRes = await fetch(`${baseUrl}/api/v1/providers/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      title: 'Ceiling Fan Repair & Motor Troubleshooting',
      description: 'Expert ceiling fan and appliance repairs including capacitor and regulator fixing.',
      category: repairCategory._id,
      serviceType: 'ON_SITE',
      rateType: 'FIXED',
      rateAmount: 35,
      locationLabel: 'Downtown',
    }),
  });
  const serviceData = await serviceRes.json();
  assert.equal(serviceRes.status, 201);
  assert.equal(serviceData.service.title, 'Ceiling Fan Repair & Motor Troubleshooting');
});

let createdNeedId;
let matchedServiceId;

test('4. TWO-PHASE MATCHING (Phase 1) - User 2 posts fan repair need and matches professional provider', async () => {
  const needRes = await fetch(`${baseUrl}/api/v1/needs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`,
    },
    body: JSON.stringify({
      title: 'Need urgent ceiling fan repair and capacitor replacement',
      description: 'Living room ceiling fan making humming noise and running slowly.',
      category: repairCategory._id,
      needType: 'service',
      urgency: 'HIGH',
      locationLabel: 'Downtown Area',
    }),
  });

  const needData = await needRes.json();
  assert.equal(needRes.status, 201);
  assert.equal(needData.success, true);
  assert.ok(needData.matches);
  assert.equal(needData.matches.hasCommercialSolution, true);
  assert.ok(needData.matches.phase1Providers.length > 0);

  const bestMatch = needData.matches.phase1Providers[0];
  assert.equal(bestMatch.provider.name, 'Bob Electrician');
  assert.ok(bestMatch.matchScore >= 60);
  assert.ok(bestMatch.matchReason.includes('Category Match'));

  createdNeedId = needData.need.id;
  matchedServiceId = bestMatch.service._id;
});

let createdBookingId;

test('5. BOOKING & REVIEW LIFECYCLE - User 2 books Bob, Bob accepts, completes, and gets 5★ review', async () => {
  // User 2 creates booking
  const bookRes = await fetch(`${baseUrl}/api/v1/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`,
    },
    body: JSON.stringify({
      serviceId: matchedServiceId,
      needId: createdNeedId,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Please bring a replacement capacitor if possible.',
    }),
  });
  const bookData = await bookRes.json();
  assert.equal(bookRes.status, 201);
  assert.equal(bookData.booking.status, 'PENDING');
  createdBookingId = bookData.booking._id;

  // Bob (Provider) views incoming bookings
  const incomingRes = await fetch(`${baseUrl}/api/v1/bookings/incoming-provider`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const incomingData = await incomingRes.json();
  assert.equal(incomingRes.status, 200);
  assert.ok(incomingData.bookings.length > 0);

  // Bob accepts booking
  const acceptRes = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const acceptData = await acceptRes.json();
  assert.equal(acceptRes.status, 200);
  assert.equal(acceptData.booking.status, 'ACCEPTED');

  // Complete booking
  const completeRes = await fetch(`${baseUrl}/api/v1/bookings/${createdBookingId}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const completeData = await completeRes.json();
  assert.equal(completeRes.status, 200);
  assert.equal(completeData.booking.status, 'COMPLETED');

  // User 2 submits 5★ review
  const reviewRes = await fetch(`${baseUrl}/api/v1/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`,
    },
    body: JSON.stringify({
      bookingId: createdBookingId,
      rating: 5,
      comment: 'Excellent service! Repaired the ceiling fan in 20 minutes.',
    }),
  });
  const reviewData = await reviewRes.json();
  assert.equal(reviewRes.status, 201);
  assert.equal(reviewData.review.rating, 5);

  // Verify Bob's provider profile rating is updated
  const bobProfileRes = await fetch(`${baseUrl}/api/v1/providers/public/${user1Id}`);
  const bobProfileData = await bobProfileRes.json();
  assert.equal(bobProfileRes.status, 200);
  assert.equal(bobProfileData.profile.rating, 5);
  assert.equal(bobProfileData.profile.reviewCount, 1);
  assert.equal(bobProfileData.profile.completedBookingsCount, 1);
});

let sharedResourceId;
let studentNeedId;
let createdShareRequestId;

test('6. COMMUNITY FALLBACK MATCHING (Phase 2) - Textbook share when no commercial provider exists', async () => {
  // User 3 (Charlie) lists Engineering Physics Textbook for community lending
  const resRes = await fetch(`${baseUrl}/api/v1/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user3Token}`,
    },
    body: JSON.stringify({
      title: 'University Physics with Modern Physics by Young & Freedman',
      description: '14th Edition textbook in great condition for physics 101 and engineering students.',
      category: studyCategory._id,
      resourceType: 'book',
      condition: 'LIKE_NEW',
      shareType: 'LEND',
      metadata: {
        author: 'Young & Freedman',
        subject: 'Engineering Physics',
        edition: '14th',
      },
      locationLabel: 'Campus North Hostel',
    }),
  });
  const resData = await resRes.json();
  assert.equal(resRes.status, 201);
  sharedResourceId = resData.resource._id || resData.resource.id;

  // User 4 (David Junior) posts need for Physics textbook (No commercial services listed in this category)
  const needRes = await fetch(`${baseUrl}/api/v1/needs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user4Token}`,
    },
    body: JSON.stringify({
      title: 'Need University Physics textbook for midterm exam prep',
      description: 'Looking for Young and Freedman physics book for 2 weeks.',
      category: studyCategory._id,
      needType: 'resource',
      urgency: 'HIGH',
      locationLabel: 'Campus Area',
    }),
  });
  const needData = await needRes.json();
  assert.equal(needRes.status, 201);
  studentNeedId = needData.need._id || needData.need.id;

  // Fallback check: Commercial providers = 0, Fallback Community Solutions = 1
  assert.equal(needData.matches.hasCommercialSolution, false);
  assert.equal(needData.matches.hasCommunitySolution, true);
  assert.equal(needData.matches.fallbackActivated, true);

  const fallbackMatch = needData.matches.phase2Fallbacks[0];
  assert.equal(fallbackMatch.isFallback, true);
  assert.equal(fallbackMatch.owner.name, 'Charlie Student');
  assert.ok(fallbackMatch.matchReason.includes('Community Solution'));

  // User 4 sends ShareRequest to Charlie
  const shareReqRes = await fetch(`${baseUrl}/api/v1/shares`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user4Token}`,
    },
    body: JSON.stringify({
      resourceId: sharedResourceId,
      needId: studentNeedId,
      requestType: 'BORROW',
      durationDays: 14,
      message: 'Hi Charlie! Would love to borrow your physics textbook for 2 weeks for midterm preparation.',
    }),
  });
  const shareReqData = await shareReqRes.json();
  assert.equal(shareReqRes.status, 201);
  createdShareRequestId = shareReqData.shareRequest._id;

  // Charlie accepts ShareRequest
  const acceptRes = await fetch(`${baseUrl}/api/v1/shares/${createdShareRequestId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${user3Token}` },
  });
  const acceptData = await acceptRes.json();
  assert.equal(acceptRes.status, 200);
  assert.equal(acceptData.shareRequest.status, 'ACCEPTED');

  // Complete and return resource
  const completeRes = await fetch(`${baseUrl}/api/v1/shares/${createdShareRequestId}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${user3Token}` },
  });
  const completeData = await completeRes.json();
  assert.equal(completeRes.status, 200);
  assert.equal(completeData.shareRequest.status, 'COMPLETED');
});

test('7. NOTIFICATIONS - User 1 and User 3 have received transaction notifications', async () => {
  const notifRes = await fetch(`${baseUrl}/api/v1/notifications`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const notifData = await notifRes.json();
  assert.equal(notifRes.status, 200);
  assert.ok(notifData.notifications.length > 0);

  const firstNotifId = notifData.notifications[0]._id;
  const readRes = await fetch(`${baseUrl}/api/v1/notifications/${firstNotifId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const readData = await readRes.json();
  assert.equal(readRes.status, 200);
  assert.equal(readData.notification.isRead, true);
});

test('8. ADMIN STATISTICS - Comprehensive platform stats reflect all activities', async () => {
  const statsRes = await fetch(`${baseUrl}/api/v1/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  assert.equal(statsRes.status, 200);

  const { stats } = statsData;
  assert.ok(stats.totalUsers >= 5);
  assert.ok(stats.totalNeeds >= 2);
  assert.ok(stats.totalBookings >= 1);
  assert.ok(stats.completedBookings >= 1);
  assert.ok(stats.totalResources >= 1);
  assert.ok(stats.totalServices >= 1);
  assert.ok(stats.totalCategories >= 7);
});
