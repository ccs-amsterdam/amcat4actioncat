import { get_user } from "@/auth";
import { jest } from "@jest/globals";

// __mocks__/axios.js
const mockAxios = jest.createMockFromModule("axios") as any;

mockAxios.get = jest.fn(async (url, config) => {
  if (url === "https://middlecat.up.railway.app/api/configuration")
    // return 'secret' as public key, should be same as used in test auth to sign token
    return Promise.resolve({ data: { public_key: "secret" } });
  if (url === "http://example.com/users/me") {
    // resolve user token to email (should be writer@something, admin@something etc), then set role
    const user = await get_user({ headers: { authorization: config.headers.Authorization } } as any);
    const role = user.email.split("@").at(0)?.toUpperCase();
    return Promise.resolve({ data: { role } });
  }
});

export default mockAxios;
