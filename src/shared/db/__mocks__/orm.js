export const ORM = {
  em: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    assign: jest.fn(),
    flush: jest.fn(),
    removeAndFlush: jest.fn(),
    getReference: jest.fn(),
  },
};