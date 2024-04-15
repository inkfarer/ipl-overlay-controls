import { ObsConnectorService } from '../../services/ObsConnectorService';
import { ObsConnectorController } from '../ObsConnectorController';
import { mock } from 'jest-mock-extended';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { controllerListeners } from '../../__mocks__/MockBaseController';

describe('ObsConnectorController', () => {
    let obsConnectorService: ObsConnectorService;

    beforeEach(() => {
        obsConnectorService = mock<ObsConnectorService>();
        new ObsConnectorController(mockNodecg, obsConnectorService);
    });

    describe('connectToObs', () => {
        it('re-assigns credentials and throws an error if obs integration is disabled', async () => {
            replicants.obsData = {
                enabled: false
            };

            await expect(() => controllerListeners.connectToObs({
                address: 'localhost:9090',
                password: 'test pwd'
            })).rejects.toThrow(new Error('translation:obs.obsSocketDisabled'));

            expect(replicants.obsCredentials).toEqual({
                address: 'localhost:9090',
                password: 'test pwd'
            });
            expect(obsConnectorService.stopReconnecting).not.toHaveBeenCalled();
            expect(obsConnectorService.connect).not.toHaveBeenCalled();
        });

        it('connects to OBS if integration is enabled', async () => {
            replicants.obsData = {
                enabled: true
            };

            await controllerListeners.connectToObs({
                address: 'localhost:10284',
                password: 'test pwd2'
            });

            expect(replicants.obsCredentials).toEqual({
                address: 'localhost:10284',
                password: 'test pwd2'
            });
            expect(obsConnectorService.stopReconnecting).toHaveBeenCalled();
            expect(obsConnectorService.connect).toHaveBeenCalled();
        });
    });

    describe('setObsData', () => {
        it.each([
            ['scene1', 'scene3'],
            ['scene3', 'scene1']
        ])('throws an error if the gameplay scene is not found (%#)', (gameplayScene, intermissionScene) => {
            replicants.obsData = {
                scenes: ['scene1', 'scene2']
            };

            expect(() => controllerListeners.setObsData({ gameplayScene, intermissionScene }))
                .toThrow(new Error('translation:obs.sceneNotFound'));
        });

        it('re-assigns the gameplay and intermission scenes', () => {
            replicants.obsData = {
                enabled: true,
                scenes: ['scene1', 'scene2', 'scene3']
            };

            controllerListeners.setObsData({ gameplayScene: 'scene2', intermissionScene: 'scene3' });

            expect(replicants.obsData).toEqual({
                enabled: true,
                scenes: ['scene1', 'scene2', 'scene3'],
                gameplayScene: 'scene2',
                intermissionScene: 'scene3'
            });
        });
    });

    describe('setObsSocketEnabled', () => {
        it('throws an error if the required arguments are not provided', async () => {
            await expect(() => controllerListeners.setObsSocketEnabled())
                .rejects.toThrow(new Error('translation:invalidArgumentsError'));
            expect(obsConnectorService.disconnect).not.toHaveBeenCalled();
            expect(obsConnectorService.connect).not.toHaveBeenCalled();
        });

        it('disconnects from obs when disabling the socket', async () => {
            replicants.obsData = {};

            await controllerListeners.setObsSocketEnabled(false);

            expect(replicants.obsData).toEqual({
                enabled: false
            });
            expect(obsConnectorService.disconnect).toHaveBeenCalled();
            expect(obsConnectorService.connect).not.toHaveBeenCalled();
        });

        it('connects to obs when enabling the socket', async () => {
            replicants.obsData = {};

            await controllerListeners.setObsSocketEnabled(true);

            expect(replicants.obsData).toEqual({
                enabled: true
            });
            expect(obsConnectorService.connect).toHaveBeenCalled();
            expect(obsConnectorService.disconnect).not.toHaveBeenCalled();
        });
    });
});
