const parseLine = (str) => {
  const match = /^(.*?):\s?(.*)$/.exec(str);

  if (!match) {
    return [null, str];
  }

  return [match[1], match[2]].map((i) => i || null);
};

const createParseChunkFn = (onParse) => {
  let buffer = '';

  const parseBuffer = () => {
    let eventName = null;
    let eventId = null;

    for (const line of buffer.split('\n')) {
      if (!line || line.startsWith(':')) {
        // Ignore invalid data
      } else {
        const [field, value] = parseLine(line);

        switch (field) {
          case 'event':
            eventName = value;
            break;

          case 'id':
            eventId = value;
            break;

          case 'data':
            onParse({
              type: 'event',
              event: eventName,
              id: eventId,
              data: value,
            });
            break;

          case 'retry':
            const retry = Number(value);
            if (!Number.isNaN(retry)) {
              onParse({ type: 'retry', value: retry });
            }
            break;

          default:
            break;
        }
      }
    }
  };

  return (chunk) => {
    buffer += chunk;

    if (buffer.endsWith('\n\n')) {
      parseBuffer();
      buffer = '';
    }
  };
};

const ask = async (onMessage, messages) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'YOUR_OPENAI_KEY', // Fill your OpenAI key
    },
    body: JSON.stringify({
      stream: true,
      max_tokens: 1000,
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      top_p: 1,
      presence_penalty: 1,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error('Fetch sse error');
  }

  const parseChunk = createParseChunkFn((event) => {
    if (event.type === 'event') {
      onMessage(event.data);
    }
  });

  const reader = res.body?.getReader();
  if (reader) {
    void (function read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          return;
        }
        const chunk = new TextDecoder().decode(value);
        parseChunk(chunk);
        read();
      });
    })();
  }
};

export default ask;
