const express = require('express');
const app = express();
app.use(express.json());

app.post('/mcp', (req, res) => {
  const tool = req.body.tool;
  const { habit_name, streak } = req.body.input || {};

  if (tool === 'send_reminder') {
    console.log(`[habit-reminders MCP] Sent reminder: "${habit_name}" — ${streak}-day streak at risk.`);
    res.json({ result: `Reminder sent for ${habit_name}` });
  } else {
    res.status(400).json({ error: 'Unknown tool' });
  }
});

app.listen(4000, () => console.log('MCP server running on port 4000'));
