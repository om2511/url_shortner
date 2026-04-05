# Learnings

2026-04-05: This project cannot rely on the CRA `proxy` field for production because the frontend and backend are deployed separately. Production deployment requires an explicit frontend API base URL or hosting-layer rewrites.
2026-04-05: In this CRA setup, importing the shared Axios client directly into the tested component tree causes Jest to choke on Axios ESM. The stable fix is to mock the local API wrapper in tests instead of letting the test runtime parse Axios during module import.
