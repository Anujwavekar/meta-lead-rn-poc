require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

const leads = [];

/*
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    message: "Meta Lead RN PoC backend is running",
  });
});

/*
 * Meta webhook verification
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed");
  return res.sendStatus(403);
});

/*
 * Meta webhook - receives leadgen_id
 */
app.post("/webhook", async (req, res) => {
  console.log("Webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  // Respond immediately to Meta
  res.sendStatus(200);

  try {
    const entry = req.body.entry || [];

    for (const item of entry) {
      const changes = item.changes || [];

      for (const change of changes) {
        if (change.field !== "leadgen") {
          continue;
        }

        const leadgenId = change.value?.leadgen_id;

        if (!leadgenId) {
          console.log("No leadgen_id found");
          continue;
        }

        console.log("leadgen_id:", leadgenId);

        await retrieveLead(leadgenId);
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error.message);
  }
});

/*
 * Retrieve full lead from Meta Graph API
 */
async function retrieveLead(leadgenId) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error(
      "META_PAGE_ACCESS_TOKEN is missing. Cannot retrieve lead from Meta."
    );
    return;
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v26.0/${leadgenId}`,
      {
        params: {
          fields: "id,created_time,field_data",
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );

    const metaLead = response.data;

    console.log("Lead retrieved from Meta:");
    console.log(JSON.stringify(metaLead, null, 2));

    const lead = {
      id: metaLead.id,
      created_time: metaLead.created_time,
      field_data: metaLead.field_data || [],
    };

    leads.push(lead);

    console.log("NEW LEAD RECEIVED:");
    console.log(lead);

    // Send lead to React Native
    io.emit("new_lead", lead);
  } catch (error) {
    console.error(
      "Error retrieving lead:",
      error.response?.data || error.message
    );
  }
}

/*
 * Test lead endpoint
 * Used to test React Native without depending on Meta.
 */
app.post("/test-lead", (req, res) => {
  const { name, email, phone } = req.body;

  const lead = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    created_time: new Date().toISOString(),
  };

  leads.push(lead);

  console.log("NEW LEAD RECEIVED:");
  console.log(lead);

  io.emit("new_lead", lead);

  res.status(201).json({
    message: "Test lead created",
    lead,
  });
});

/*
 * Get all stored leads
 */
app.get("/leads", (req, res) => {
  res.json(leads);
});

/*
 * Socket.io connection
 */
io.on("connection", (socket) => {
  console.log("React Native connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("React Native disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});