import { defineRoutes } from './index';
import { DEVICES_INDEX } from '../../common/constants';

// --- Mock helpers -----------------------------------------------------------

function createMockRouter() {
  const routes: Record<string, { config: any; handler: Function }> = {};
  return {
    get: jest.fn((config, handler) => {
      routes[`GET ${config.path}`] = { config, handler };
    }),
    post: jest.fn((config, handler) => {
      routes[`POST ${config.path}`] = { config, handler };
    }),
    delete: jest.fn((config, handler) => {
      routes[`DELETE ${config.path}`] = { config, handler };
    }),
    routes,
  };
}

function createMockOpenSearchClient() {
  return {
    index: jest.fn(),
    get: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
  };
}

function createMockContext(client: ReturnType<typeof createMockOpenSearchClient>) {
  return {
    core: {
      opensearch: {
        client: { asCurrentUser: client },
      },
      savedObjects: {
        client: {
          get: jest.fn(),
        },
      },
    },
  } as any;
}

function createMockResponse() {
  return {
    ok: jest.fn((opts) => ({ status: 200, ...opts })),
    customError: jest.fn((opts) => ({ status: opts.statusCode, ...opts })),
  };
}

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as any;

// --- Test suite -------------------------------------------------------------

describe('Device API routes', () => {
  let router: ReturnType<typeof createMockRouter>;
  let client: ReturnType<typeof createMockOpenSearchClient>;
  let context: any;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    router = createMockRouter();
    client = createMockOpenSearchClient();
    context = createMockContext(client);
    res = createMockResponse();

    defineRoutes(router as any, { logger: mockLogger });
  });

  // ---- Route registration --------------------------------------------------

  describe('route registration', () => {
    it('should register DELETE /api/integrations/device', () => {
      expect(router.delete).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/api/integrations/device' }),
        expect.any(Function)
      );
    });

    it('should register POST /api/integrations/device', () => {
      expect(router.post).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/api/integrations/device' }),
        expect.any(Function)
      );
    });

    it('should register GET /api/integrations/device', () => {
      expect(router.get).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/api/integrations/device' }),
        expect.any(Function)
      );
    });
  });

  // ---- DELETE /api/integrations/device -------------------------------------

  describe('DELETE /api/integrations/device', () => {
    let handler: Function;

    beforeEach(() => {
      handler = router.routes['DELETE /api/integrations/device'].handler;
    });

    it('should delete an existing device and return 200', async () => {
      const uid = '01HZWK4A3H9Q2T8K8YV2Z9M1QK';
      client.delete.mockResolvedValue({ body: { result: 'deleted' } });

      await handler(context, { query: { uid } }, res);

      expect(client.delete).toHaveBeenCalledWith({
        index: DEVICES_INDEX,
        id: uid,
        refresh: 'wait_for',
      });
      expect(res.ok).toHaveBeenCalledWith({
        body: { message: `Device with uid=${uid} deleted` },
      });
    });

    it('should return 404 when deleting a non-existent device', async () => {
      const uid = 'NON_EXISTENT_UID';
      const notFoundError: any = new Error('Not Found');
      notFoundError.statusCode = 404;
      client.delete.mockRejectedValue(notFoundError);

      await handler(context, { query: { uid } }, res);

      expect(res.customError).toHaveBeenCalledWith({
        statusCode: 404,
        body: { message: `Device with uid=${uid} not found` },
      });
    });

    it('should return 500 on unexpected errors', async () => {
      const uid = '01HZWK4A3H9Q2T8K8YV2Z9M1QK';
      client.delete.mockRejectedValue(new Error('Connection refused'));

      await handler(context, { query: { uid } }, res);

      expect(res.customError).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 500 })
      );
    });
  });

  // ---- GET /api/integrations/device ----------------------------------------

  describe('GET /api/integrations/device', () => {
    let handler: Function;

    beforeEach(() => {
      handler = router.routes['GET /api/integrations/device'].handler;
    });

    // Test case 1: GET with non-existent uid → 404
    it('should return 404 for a non-existent uid', async () => {
      const uid = 'NON_EXISTENT_UID';
      const notFoundError: any = new Error('Not Found');
      notFoundError.statusCode = 404;
      client.get.mockRejectedValue(notFoundError);

      await handler(context, { query: { uid } }, res);

      expect(res.customError).toHaveBeenCalledWith({
        statusCode: 404,
        body: { message: `Device with uid=${uid} not found` },
      });
    });

    // Test case 2: GET without uid → return all devices
    it('should return all devices when no uid provided', async () => {
      const devices = [
        { uid: 'UID1', name: 'Device 1', connection: 'syslog', groups_filter: 'g1' },
        { uid: 'UID2', name: 'Device 2', connection: 'syslog', groups_filter: 'g2' },
      ];
      client.search.mockResolvedValue({
        body: { hits: { hits: devices.map((d) => ({ _source: d })) } },
      });

      await handler(context, { query: {} }, res);

      expect(res.ok).toHaveBeenCalledWith({ body: devices });
    });

    it('should return empty array when index does not exist', async () => {
      const notFoundError: any = new Error('index_not_found_exception');
      notFoundError.statusCode = 404;
      client.search.mockRejectedValue(notFoundError);

      await handler(context, { query: {} }, res);

      expect(res.ok).toHaveBeenCalledWith({ body: [] });
    });

    it('should return a single device by uid', async () => {
      const device = {
        uid: '01HZWK4A3H9Q2T8K8YV2Z9M1QK',
        name: 'Scopd DLP',
        connection: 'syslog',
        groups_filter: 'scopd',
        allowed_ips: '192.168.2.0/24',
        rules_file: 'scopd_rules.xml',
        decoders_file: 'scopd_decoders.xml',
        created_at: '2026-02-15T12:34:56Z',
      };
      client.get.mockResolvedValue({ body: { _source: device } });

      await handler(context, { query: { uid: device.uid } }, res);

      expect(res.ok).toHaveBeenCalledWith({ body: device });
    });
  });

  // ---- POST /api/integrations/device — schema validation --------------------

  describe('POST /api/integrations/device — schema validation', () => {
    it('should reject connection values other than "syslog" (test case 5)', () => {
      const postConfig = router.routes['POST /api/integrations/device'].config;
      const bodySchema = postConfig.validate.body;

      expect(() =>
        bodySchema.validate({
          name: 'Scopd DLP',
          connection: 'http',
          groups_filter: 'scopd',
        })
      ).toThrow();
    });

    it('should accept connection="syslog"', () => {
      const postConfig = router.routes['POST /api/integrations/device'].config;
      const bodySchema = postConfig.validate.body;

      expect(() =>
        bodySchema.validate({
          name: 'Scopd DLP',
          connection: 'syslog',
          groups_filter: 'scopd',
        })
      ).not.toThrow();
    });
  });

  // ---- POST /api/integrations/device ---------------------------------------

  describe('POST /api/integrations/device', () => {
    let handler: Function;

    beforeEach(() => {
      handler = router.routes['POST /api/integrations/device'].handler;
    });

    it('should create a device and return uid', async () => {
      client.index.mockResolvedValue({ body: { result: 'created' } });

      const body = {
        name: 'Scopd DLP',
        connection: 'syslog',
        groups_filter: 'scopd',
        allowed_ips: '192.168.2.0/24',
        rules_file: 'scopd_rules.xml',
        decoders_file: 'scopd_decoders.xml',
      };

      await handler(context, { body }, res);

      expect(client.index).toHaveBeenCalledWith(
        expect.objectContaining({
          index: DEVICES_INDEX,
          refresh: 'wait_for',
        })
      );
      expect(res.ok).toHaveBeenCalledWith({
        body: { uid: expect.any(String) },
      });
    });

    it('should set optional fields to null when omitted', async () => {
      client.index.mockResolvedValue({ body: { result: 'created' } });

      const body = {
        name: 'Scopd DLP',
        connection: 'syslog',
        groups_filter: 'scopd',
      };

      await handler(context, { body }, res);

      const indexCall = client.index.mock.calls[0][0];
      expect(indexCall.body.allowed_ips).toBeNull();
      expect(indexCall.body.rules_file).toBeNull();
      expect(indexCall.body.decoders_file).toBeNull();
    });

    it('should return 500 on indexer error', async () => {
      client.index.mockRejectedValue(new Error('Indexer unavailable'));

      const body = {
        name: 'Scopd DLP',
        connection: 'syslog',
        groups_filter: 'scopd',
      };

      await handler(context, { body }, res);

      expect(res.customError).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 500 })
      );
    });
  });

  // ---- Integration: POST → GET → DELETE → GET (Test case 10) ---------------

  describe('POST → GET → DELETE → GET flow', () => {
    it('should create, retrieve, delete, then 404 on re-fetch', async () => {
      const postHandler = router.routes['POST /api/integrations/device'].handler;
      const getHandler = router.routes['GET /api/integrations/device'].handler;
      const deleteHandler = router.routes['DELETE /api/integrations/device'].handler;

      // POST — create
      client.index.mockResolvedValue({ body: { result: 'created' } });
      const postRes = createMockResponse();
      await postHandler(
        context,
        {
          body: {
            name: 'Scopd DLP',
            connection: 'syslog',
            groups_filter: 'scopd',
            allowed_ips: '192.168.2.0/24',
            rules_file: 'scopd_rules.xml',
            decoders_file: 'scopd_decoders.xml',
          },
        },
        postRes
      );
      expect(postRes.ok).toHaveBeenCalled();
      const uid = postRes.ok.mock.calls[0][0].body.uid;
      expect(uid).toBeDefined();

      // GET — retrieve created device
      const storedDoc = {
        uid,
        name: 'Scopd DLP',
        connection: 'syslog',
        groups_filter: 'scopd',
        allowed_ips: '192.168.2.0/24',
        rules_file: 'scopd_rules.xml',
        decoders_file: 'scopd_decoders.xml',
        created_at: expect.any(String),
      };
      client.get.mockResolvedValue({ body: { _source: storedDoc } });
      const getRes1 = createMockResponse();
      await getHandler(context, { query: { uid } }, getRes1);
      expect(getRes1.ok).toHaveBeenCalledWith({ body: storedDoc });

      // DELETE
      client.delete.mockResolvedValue({ body: { result: 'deleted' } });
      const delRes = createMockResponse();
      await deleteHandler(context, { query: { uid } }, delRes);
      expect(delRes.ok).toHaveBeenCalledWith({
        body: { message: `Device with uid=${uid} deleted` },
      });

      // GET again — should be 404
      const notFoundError: any = new Error('Not Found');
      notFoundError.statusCode = 404;
      client.get.mockRejectedValue(notFoundError);
      const getRes2 = createMockResponse();
      await getHandler(context, { query: { uid } }, getRes2);
      expect(getRes2.customError).toHaveBeenCalledWith({
        statusCode: 404,
        body: { message: `Device with uid=${uid} not found` },
      });
    });
  });
});
