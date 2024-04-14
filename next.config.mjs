/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack:  (config, { isServer }) => {
        // Add alias for 'formidable'
        config.resolve.alias = {
            ...config.resolve.alias,
            // formidable: false,
        };
        return config;
    },
};

export default nextConfig;
