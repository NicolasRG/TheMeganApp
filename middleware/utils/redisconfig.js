'use strict';

const RedisConfig = {
    namespace: "meganapp",
    redis: {
        client: 'redis',
        options: {
            host: '127.0.0.1',
            port: 6379,
            connect_timeout: 3600000,
            db: 1
        },
    },
    logger: {
        enabled: true,
        options: {
            level: 'info',
            /*
            streams: [
                {
                    path: path.normalize(`${__dirname}/../logs/redis-smq.log`)
                },
            ],
            */
        },
    },
    messages: {
      store: false,
    },
    
};

export {RedisConfig}