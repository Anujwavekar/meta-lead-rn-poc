# Meta Lead Ads + React Native PoC

A Proof of Concept demonstrating real-time delivery of Meta Lead Ads into an already-open React Native application.

When a test lead is submitted through Meta's Lead Ads Testing Tool, Meta sends a webhook event to the Node.js backend. The backend retrieves the lead information using the Meta Graph API and sends the lead to the React Native application through Socket.IO.

The lead appears in the mobile application's lead list without any manual action on the device.

---

## Demo

### Working Demo

Loom Video:  
https://drive.google.com/file/d/19vILVLfamuWri8BTc-P4aRZOQPqnoRSV/view?usp=drive_link

### Code & Architecture 

Loom Video:  
https://drive.google.com/file/d/1WU7_d1IeRxqq53wkkhYiDfVIOkjt7gm4/view?usp=drive_link
---

## Problem Statement

The objective of this PoC is to demonstrate the following flow:

1. A test lead is submitted using Meta's Lead Ads Testing Tool.
2. Meta sends a lead webhook event to the backend.
3. The Node.js backend receives the webhook.
4. The backend retrieves the lead information from Meta.
5. The backend emits the lead through Socket.IO.
6. The already-open React Native application receives the event.
7. The lead is immediately displayed in the leads list.

No manual refresh or interaction is required on the mobile device.

---

## Architecture

```text
                 Meta Lead Ads
                       |
                       | Test Lead Submission
                       v
            Meta Lead Testing Tool
                       |
                       | Webhook
                       v
              Node.js / Express
                       |
                       | Meta Graph API
                       v
                 Lead Details
                       |
                       | Socket.IO
                       v
              React Native App
                       |
                       v
                  Leads List
