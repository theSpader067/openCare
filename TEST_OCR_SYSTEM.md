# OCR System Testing Guide

## Quick Start Testing

### Prerequisites
- Mobile app built and running
- Backend running locally or deployed
- Test images prepared (photos of medical documents)

### 5-Minute Test

1. **Start mobile app**
   ```bash
   cd /mnt/mydata/projects/Opencare_mobile
   npm start
   # or
   expo start
   ```

2. **Login to mobile app**
   - Use test credentials
   - Verify authentication successful

3. **Navigate to Analyses**
   - Click "Analyses" tab
   - Locate "Pending Orders" section
   - Click on any pending order

4. **Upload test image**
   - Click "📷 Ajouter une photo"
   - Select "Choose from Library" or "Take Photo"
   - Select a test image (medical document)

5. **Monitor logs**
   - Check console for `[ANALYSES]` logs
   - Verify base64 encoding happens
   - Watch for `OCR response received`

6. **Verify results**
   - Success alert should appear
   - Alert shows extracted text character count
   - Extracted text available in text field

### Expected Log Output

**Mobile logs:**
```
[ANALYSES] Image selected: { uri: "...", width: 1080, height: 1920 }
[ANALYSES] Original blob size: 3456789 bytes
[ANALYSES] Base64 string length: 4608385 characters
[ANALYSES] Estimated JSON payload size: 6125000 bytes
[API_CLIENT] Interceptor running
[API_CLIENT] Method: POST
[API_CLIENT] URL: https://itsopencare.com/api/analyses/ocr
[API_CLIENT] Token exists: true
[API_CLIENT] ✓ Authorization header injected
[ANALYSES] Base64 first 100 chars: /9j/4AAQSkZJRgABAQAASABIAAD/4QCM...
[API_CLIENT] Response error (if 200):
[ANALYSES] OCR response received: {
  status: 200,
  hasData: true,
  parsedText: "Hemoglobin 13.5 g/dL Hematocrit 40...",
  confidence: 85
}
```

**Backend logs:**
```
=== OCR REQUEST RECEIVED ===
Original base64 image length: 4608385
Base64 first 100 chars: /9j/4AAQSkZJRgABAQAASABIAAD/4QCM...
Estimated base64 size (MB): 3.49
[OCR_COMPRESS] Original size: 3456789 bytes
[OCR_COMPRESS] Compressed size: 589234 bytes
[OCR_COMPRESS] Reduction: 82.9%
Sending OCR request to OCRSpace API
OCRSpace API response status: 200
OCRSpace API result: {
  isErrored: false,
  hasText: true,
  textLength: 456
}
=== OCR EXTRACTION COMPLETE ===
Extracted Text: (full medical test results)
Text Length: 456
Confidence: 85
==============================
```

## Detailed Testing

### Test Case 1: Small Image (< 1 MB)

**Setup:**
- Use a 800 KB or smaller image

**Expected Behavior:**
1. Mobile sends base64 (~1.1 MB)
2. Backend receives without compression
3. OCRSpace processes immediately
4. Text extracted successfully

**Verification:**
- No `[OCR_COMPRESS]` logs
- `OCRSpace API response status: 200`
- Non-empty `parsedText`

### Test Case 2: Medium Image (1-3 MB)

**Setup:**
- Use a 2 MB image (typical medical document scan)

**Expected Behavior:**
1. Mobile sends base64 (~2.7 MB)
2. Backend receives and compresses
3. Compression reduces to ~600 KB
4. OCRSpace processes compressed image
5. Text extracted successfully

**Verification:**
```
Estimated base64 size (MB): 2.75 > 0.8
[OCR_COMPRESS] Original size: 2000000 bytes
[OCR_COMPRESS] Compressed size: 589234 bytes
[OCR_COMPRESS] Reduction: 70.5%
```

### Test Case 3: Large Image (3-5 MB)

**Setup:**
- Use a 4 MB or larger image

**Expected Behavior:**
1. Mobile sends base64 (~5.3 MB)
2. Backend aggressively compresses
3. Compression reduces to ~650 KB
4. OCRSpace processes
5. Text extracted

**Verification:**
```
Estimated base64 size (MB): 5.31 > 0.8
[OCR_COMPRESS] Original size: 4000000 bytes
[OCR_COMPRESS] Compressed size: 650000 bytes
[OCR_COMPRESS] Reduction: 83.75%
```

### Test Case 4: Error - Image Too Large (> 10 MB)

**Setup:**
- Attempt to upload image > 10 MB

**Expected Behavior:**
- Mobile alert: "L'image est trop grande (> 10 MB). Veuillez choisir une image plus petite."
- No backend request made
- No logs generated

### Test Case 5: Sharp Not Available

**Setup:**
- Temporarily uninstall sharp: `npm uninstall sharp`

**Expected Behavior:**
1. Mobile sends image
2. Backend attempts Sharp import
3. Sharp import fails gracefully
4. Uses original image
5. Sends original to OCRSpace

**Verification:**
```
[OCR_COMPRESS] Sharp not available, skipping compression
```

**Restore Sharp:**
```bash
npm install sharp
```

### Test Case 6: Authentication Failure

**Setup:**
- Use invalid or expired token

**Expected Behavior:**
1. Mobile sends request
2. Backend rejects with 401
3. Mobile shows error

**Verification:**
```
Backend: "Unauthorized" (401)
Mobile: Alert shows error message
```

### Test Case 7: OCRSpace API Failure

**Setup:**
- Disable internet or mock OCRSpace failure

**Expected Behavior:**
1. Mobile sends image
2. Backend processes image
3. OCRSpace API call fails
4. Backend returns 500 error
5. Mobile shows error alert

**Verification:**
```
OCRSpace API error response: (error details)
Backend: { error: "Failed to process OCR request" } (500)
```

### Test Case 8: Image Quality Impact

**Setup:**
- Test with varying image qualities
- Test with blurry images
- Test with clear images

**Expected Behavior:**
- Clear images: High confidence (80-95)
- Slightly blurry: Medium confidence (60-80)
- Very blurry: Low/zero confidence or empty text

**Observation:**
- Monitor `confidence` field in response
- Consider implementing low-confidence alerts for future

## Load Testing

### Single Image Test
**Metric:** Time from upload to result
**Expected:** < 10 seconds for 3 MB image

### Multiple Consecutive Images
**Test:** Upload 3 images in sequence
**Expected:** Each completes successfully

### Concurrent Requests (if applicable)
**Test:** Multiple users upload simultaneously
**Verify:** No race conditions or shared state issues

## Performance Metrics

### Typical Execution Times (3 MB image)

| Step | Expected Time |
|------|--------------|
| Mobile image selection | ~2 sec |
| Base64 encoding | ~1 sec |
| Network transmission | ~3 sec |
| Backend compression | ~2 sec |
| OCRSpace processing | ~5 sec |
| Response transmission | ~1 sec |
| Total | ~14 sec |

### Size Reduction

| Scenario | Original | Compressed | Reduction |
|----------|----------|-----------|-----------|
| 2 MB JPEG | 2.7 MB | 590 KB | 78% |
| 3 MB JPEG | 4.0 MB | 650 KB | 84% |
| 4 MB PNG | 5.3 MB | 720 KB | 86% |
| 5 MB multi-page | 6.7 MB | 800 KB | 88% |

## Integration Testing

### Test 1: Full Mobile Workflow
```
App Start
  ↓
Login
  ↓
Navigate to Analyses
  ↓
Select pending order
  ↓
Upload image
  ↓
Verify OCR text extraction
  ↓
Verify text is stored
  ↓
✓ SUCCESS
```

### Test 2: Backend Isolation
```bash
# Test backend directly with curl
curl -X POST https://itsopencare.com/api/analyses/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"base64Image":"iVBORw0KGgoAAAANS..."}' \
  -w "\nHTTP Status: %{http_code}\n"
```

### Test 3: OCRSpace Direct Test
```bash
# Test OCRSpace API directly
curl -X POST https://api.ocr.space/parse/image \
  -d "apikey=K82729097788957" \
  -d "base64image=data:image/jpeg;base64,..." \
  -d "language=fre" \
  -d "filetype=jpeg"
```

## Regression Tests

### Before Each Deployment

- [ ] Small image OCR (< 1 MB)
- [ ] Medium image OCR (1-3 MB)
- [ ] Large image OCR (3-5 MB)
- [ ] Image too large error handling
- [ ] Authentication with valid token
- [ ] Authentication with invalid token
- [ ] Network timeout handling
- [ ] Multiple consecutive uploads
- [ ] Camera capture OCR
- [ ] File picker OCR
- [ ] Error alert messages display correctly
- [ ] Success alert shows character count

### Browser/Network Tools

**Mobile Console Logs:**
```javascript
// Clear logs
console.clear();

// Search for OCR logs
console.log = (msg) => {
  if (typeof msg === 'string' && msg.includes('[ANALYSES')) {
    originalLog(msg);
  }
};
```

**Backend Server Logs:**
```bash
# Monitor logs in real-time
tail -f /path/to/backend/logs/server.log | grep OCR
```

**Network Inspection:**
- Open browser DevTools (if web version)
- Go to Network tab
- Upload image
- Inspect POST request to `/api/analyses/ocr`
- Check request body size
- Check response payload
- Check timing

## Troubleshooting During Testing

### Symptom: Empty parsedText
**Possible Causes:**
1. Image quality too low
2. OCRSpace service down
3. Sharp compression too aggressive

**Debugging:**
```
1. Check compression logs:
   - Did compression happen?
   - How much was compressed?

2. Check OCRSpace response:
   - IsErroredOnProcessing flag
   - ErrorMessage field

3. Manual OCRSpace test:
   - Send compressed image directly to OCRSpace
   - Verify it works there
```

### Symptom: 413 Request Entity Too Large
**Possible Causes:**
1. Sharp not installed
2. next.config.ts not deployed
3. Reverse proxy size limit

**Debugging:**
```
1. Check Sharp installation:
   npm ls sharp

2. Check next.config.ts:
   cat next.config.ts | grep sizeLimit

3. Check reverse proxy:
   - Nginx: client_max_body_size
   - Apache: LimitRequestBody
```

### Symptom: Timeout
**Possible Causes:**
1. Network slow
2. OCRSpace overloaded
3. Image too large even after compression

**Debugging:**
```
1. Check network speed:
   - Mobile network conditions
   - Latency to server

2. Check OCRSpace status:
   - Try direct test
   - Check status page

3. Try smaller image:
   - Should complete faster
```

## Performance Optimization Tips

### For Faster OCR
1. **Reduce quality slightly**: Change from 0.85 to 0.80
2. **Pre-crop image**: Remove unnecessary parts
3. **Ensure good lighting**: Improves OCR accuracy and speed
4. **Use smaller documents**: Single-page scans process faster

### For Better Accuracy
1. **Keep quality high**: 0.85 is good balance
2. **Ensure sharp focus**: Blurry images = poor results
3. **Good contrast**: Dark text on light background
4. **Straight angle**: Not tilted or rotated

## Test Data

### Sample Medical Documents for Testing
1. Blood test results (NFS, CRP)
2. Chemistry test results (ALAT, ASAT)
3. Multi-line lab results
4. Documents with headers/footers
5. Handwritten annotations mixed with printed text

### Generate Test Images
```bash
# Create test image from text
convert -size 400x300 xc:white \
  -pointsize 14 \
  -draw "text 10,30 'Hemoglobin 13.5 g/dL'" \
  test_image.jpg
```

## Checklist for Production Deployment

- [ ] All tests pass
- [ ] Performance acceptable (< 15 sec per image)
- [ ] Error handling working
- [ ] Logs clear and useful
- [ ] Sharp installed on production server
- [ ] OCRSpace API key validated
- [ ] next.config.ts deployed with 10 MB limit
- [ ] Mobile app build published
- [ ] Backend deployed to production
- [ ] SSL certificates valid
- [ ] Monitoring/alerting configured
- [ ] Team trained on debugging process

## Test Report Template

```markdown
# OCR System Test Report
Date: YYYY-MM-DD
Tester: [Name]
Environment: [Dev/Staging/Prod]

## Test Results

### Passing Tests
- [ ] Small image OCR
- [ ] Medium image OCR
- [ ] Large image OCR

### Failing Tests
- [ ] [List any failures]

### Performance Metrics
- Average OCR time: X seconds
- Compression effectiveness: X%
- Success rate: X%

## Issues Found
1. [Issue 1]
2. [Issue 2]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Sign-Off
- [ ] Ready for production
- [ ] Needs fixes
- [ ] Needs further testing
```

---

**Testing Status:** Ready for comprehensive testing
**Last Updated:** 2025-12-08
