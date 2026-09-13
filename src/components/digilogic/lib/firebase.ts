/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local Sovereign Mock for Firebase Services
 * Provides fallback local mock providers when remote Firebase credentials are not configured.
 */

export const firebaseConfig = {
  apiKey: "mock-sovereign-key",
  authDomain: "kitt.ecosystem.local",
  projectId: "kitt-ecosystem",
  storageBucket: "kitt-ecosystem.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
  databaseURL: ""
};

export const firebaseApp = null as any;
export const rtdb = null as any;
export const db = null as any;
export const auth = null as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LIST = 'list',
  SIGN_IN = 'signIn',
  SYNC = 'sync',
}

export function handleFirestoreError(error: any, operation: OperationType, path?: string): string {
  console.warn(`[Local Sovereign Mock] Remote operation unavailable: ${operation} on ${path || 'memory'}`);
  return 'Local mode active';
}
