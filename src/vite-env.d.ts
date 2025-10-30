/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_AWS_USER_POOL_ID?: string;
  readonly VITE_AWS_USER_POOL_CLIENT_ID?: string;
  readonly VITE_AWS_USER_POOL_CLIENT_SECRET?: string;
  readonly VITE_AWS_IDENTITY_POOL_ID?: string;
  readonly VITE_AWS_TOKEN_SIGNING_URL?: string;
  readonly VITE_DYNAMODB_TABLE_NAME?: string;
  readonly VITE_DYNAMODB_PARTITION_KEY?: string;
  readonly VITE_DYNAMODB_CART_TABLE_NAME?: string;
  readonly VITE_S3_BUCKET_NAME?: string;
  readonly VITE_S3_REGION?: string;
  readonly VITE_SYNC_POLLING_INTERVAL?: string;
  readonly VITE_ENABLE_REAL_TIME_SYNC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
