// Tests unitaires pour SBah Family
import CONFIG from '../config.js';
import logger from '../logger.js';
import cacheService from '../cache-service.js';
import syncService from '../sync-service.js';
import paymentHandler from '../payment-handler.js';

// Classe de test
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // Ajouter un test
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    // Exécuter tous les tests
    async runAll() {
        console.log('Démarrage des tests unitaires...');
        this.results = {
            passed: 0,
            failed: 0,
            total: this.tests.length
        };

        for (const test of this.tests) {
            try {
                await test.testFn();
                console.log(`✅ ${test.name} - PASSED`);
                this.results.passed++;
            } catch (error) {
                console.error(`❌ ${test.name} - FAILED`);
                console.error(error);
                this.results.failed++;
            }
        }

        this.printResults();
    }

    // Afficher les résultats
    printResults() {
        console.log('\nRésultats des tests:');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passés: ${this.results.passed}`);
        console.log(`Échoués: ${this.results.failed}`);
        console.log(`Taux de réussite: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    }
}

// Création du runner de tests
const testRunner = new TestRunner();

// Tests du service de cache
testRunner.addTest('Cache Service - Set/Get', async () => {
    const key = 'test_key';
    const value = { test: 'data' };
    
    cacheService.set(key, value);
    const retrieved = cacheService.get(key);
    
    if (JSON.stringify(retrieved) !== JSON.stringify(value)) {
        throw new Error('Cache set/get failed');
    }
});

testRunner.addTest('Cache Service - Expiration', async () => {
    const key = 'expiry_test';
    const value = 'test';
    
    cacheService.set(key, value, 100); // 100ms expiration
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const retrieved = cacheService.get(key);
    if (retrieved !== null) {
        throw new Error('Cache expiration failed');
    }
});

// Tests du service de synchronisation
testRunner.addTest('Sync Service - Connection', async () => {
    await syncService.connect();
    if (!syncService.isConnected) {
        throw new Error('Sync service connection failed');
    }
});

testRunner.addTest('Sync Service - Balance Update', async () => {
    const testBalance = 1000000;
    let received = false;
    
    syncService.onBalanceUpdate((balance) => {
        if (balance === testBalance) {
            received = true;
        }
    });
    
    syncService.emit('balance_update', testBalance);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!received) {
        throw new Error('Balance update event not received');
    }
});

// Tests du gestionnaire de paiement
testRunner.addTest('Payment Handler - Order Creation', async () => {
    const amount = 300000;
    const method = CONFIG.PAYMENT_METHODS.ORANGE_MONEY;
    
    const order = await paymentHandler.createOrder(amount, method);
    
    if (!order || !order.id || order.amount !== amount) {
        throw new Error('Order creation failed');
    }
});

testRunner.addTest('Payment Handler - Cash Payment', async () => {
    const amount = 300000;
    const userId = 'test_user';
    
    try {
        await paymentHandler.processCashPayment(amount, userId);
        throw new Error('Cash payment should fail for non-admin');
    } catch (error) {
        if (error.message !== 'Accès non autorisé') {
            throw new Error('Cash payment validation failed');
        }
    }
});

// Tests de configuration
testRunner.addTest('Config - Payment Amounts', () => {
    const amounts = CONFIG.PAYMENT_AMOUNTS;
    
    if (amounts[1] !== 300000 || 
        amounts[3] !== 900000 || 
        amounts[6] !== 1800000 || 
        amounts[12] !== 3600000) {
        throw new Error('Invalid payment amounts configuration');
    }
});

testRunner.addTest('Config - Security', () => {
    const security = CONFIG.SECURITY;
    
    if (security.PASSWORD_MIN_LENGTH < 8 || 
        !security.PASSWORD_REGEX.test('Test123!')) {
        throw new Error('Invalid security configuration');
    }
});

// Tests du logger
testRunner.addTest('Logger - Levels', () => {
    const testMessage = 'Test message';
    
    logger.error(testMessage);
    logger.warn(testMessage);
    logger.info(testMessage);
    logger.debug(testMessage);
    
    const logs = logger.getLogs();
    if (logs.length !== 4) {
        throw new Error('Logger levels not working correctly');
    }
});

testRunner.addTest('Logger - Export/Import', () => {
    const testMessage = 'Test message';
    logger.info(testMessage);
    
    const exported = logger.exportLogs();
    logger.clearLogs();
    logger.importLogs(exported);
    
    const logs = logger.getLogs();
    if (logs.length !== 1 || logs[0].message !== testMessage) {
        throw new Error('Logger export/import failed');
    }
});

// Exécuter les tests si ce fichier est exécuté directement
if (require.main === module) {
    testRunner.runAll();
}

// Export du runner de tests
export default testRunner; 