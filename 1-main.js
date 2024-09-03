import dbClient from './utils/db.js';

// Function to wait until the database connection is alive
const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const maxAttempts = 10;
        const retryInterval = 1000; // 1 second

        const checkConnection = async () => {
            attempt += 1;
            console.log(`Attempt ${attempt} to check connection...`);
            
            if (attempt >= maxAttempts) {
                reject(new Error('Max attempts reached. Database not connected.'));
                return;
            }

            if (dbClient.isAlive()) {
                resolve();
            } else {
                setTimeout(checkConnection, retryInterval);
            }
        };

        checkConnection();
    });
};

// Main execution
(async () => {
    try {
        console.log('Initial connection status:', dbClient.isAlive());
        
        await waitConnection();
        
        console.log('Connection status after waiting:', dbClient.isAlive());
        console.log('Number of users:', await dbClient.nbUsers());
        console.log('Number of files:', await dbClient.nbFiles());
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
