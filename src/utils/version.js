/**
 * Version utilities for the application
 */

// Import version from package.json
import packageJson from '../../package.json';

/**
 * Get current application version
 */
export const getCurrentVersion = () => {
  return packageJson.version;
};

/**
 * Get application name
 */
export const getAppName = () => {
  return packageJson.name;
};

/**
 * Get application description
 */
export const getAppDescription = () => {
  return packageJson.description;
};

/**
 * Compare version strings
 * @param {string} version1 
 * @param {string} version2 
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
export const compareVersions = (version1, version2) => {
  const v1parts = version1.split('.').map(n => parseInt(n, 10));
  const v2parts = version2.split('.').map(n => parseInt(n, 10));
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
};

/**
 * Format version for display
 */
export const formatVersion = (version) => {
  return `v${version}`;
};

/**
 * Get version info object
 */
export const getVersionInfo = () => {
  return {
    version: getCurrentVersion(),
    name: getAppName(),
    description: getAppDescription(),
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
};