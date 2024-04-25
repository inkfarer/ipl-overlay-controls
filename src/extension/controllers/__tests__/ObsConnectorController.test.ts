import { ObsConnectorService } from '../../services/ObsConnectorService';
import { mock } from 'jest-mock-extended';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { controllerListeners } from '../../__mocks__/MockBaseController';
import { ScreenshotParserService } from '../../services/ScreenshotParserService';
import Sharp from 'sharp';
import type * as ActiveColorHelper from '../../helpers/activeColorHelper';

const mockActiveColorHelper = mock<typeof ActiveColorHelper>();
jest.mock('../../helpers/activeColorHelper', () => mockActiveColorHelper);

import { ObsConnectorController } from '../ObsConnectorController';

describe('ObsConnectorController', () => {
    let obsConnectorService: ObsConnectorService;
    let screenshotParserService: ScreenshotParserService;

    beforeEach(() => {
        obsConnectorService = mock<ObsConnectorService>();
        screenshotParserService = mock<ScreenshotParserService>();
        new ObsConnectorController(mockNodecg, obsConnectorService, screenshotParserService);
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

        it('throws an error if the gameplay input is not found', () => {
            replicants.obsData = {
                inputs: [
                    { name: 'test-input-1' },
                    { name: 'test-input-2' }
                ],
                scenes: ['scene1', 'scene2']
            };

            expect(() => controllerListeners.setObsData({
                gameplayScene: 'scene1',
                intermissionScene: 'scene2',
                gameplayInput: 'test-input-3'
            })).toThrow(new Error('translation:obs.inputNotFound'));
        });

        it('re-assigns the gameplay and intermission scenes', () => {
            replicants.obsData = {
                enabled: true,
                scenes: ['scene1', 'scene2', 'scene3'],
                inputs: [
                    { name: 'test-input-1' },
                    { name: 'test-input-2' }
                ],
            };

            controllerListeners.setObsData({
                gameplayScene: 'scene2',
                intermissionScene: 'scene3',
                gameplayInput: 'test-input-1'
            });

            expect(replicants.obsData).toEqual({
                enabled: true,
                scenes: ['scene1', 'scene2', 'scene3'],
                inputs: [
                    { name: 'test-input-1' },
                    { name: 'test-input-2' }
                ],
                gameplayScene: 'scene2',
                intermissionScene: 'scene3',
                gameplayInput: 'test-input-1'
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

    describe('setActiveColorsFromGameplaySource', () => {
        it('throws an error when the gameplay input is missing', async () => {
            replicants.obsData = { };
            await expect(controllerListeners.setActiveColorsFromGameplaySource())
                .rejects.toThrow(new Error('translation:obs.missingGameplayInput'));
        });

        it('requests a source screenshot from obs and parses its colors', async () => {
            replicants.obsData = {
                gameplayInput: 'Video Capture Device'
            };
            replicants.swapColorsInternally = false;
            const testImage = Sharp();
            (obsConnectorService.getSourceScreenshot as jest.Mock).mockResolvedValue(testImage);
            (screenshotParserService.sampleTeamColors as jest.Mock).mockResolvedValue({
                categoryName: 'Test Color',
                categoryKey: 'testColor',
                clrA: '#aaa',
                clrB: '#bbb'
            });

            await controllerListeners.setActiveColorsFromGameplaySource();

            expect(obsConnectorService.getSourceScreenshot).toHaveBeenCalledWith('Video Capture Device');
            expect(screenshotParserService.sampleTeamColors).toHaveBeenCalledWith(testImage);
            expect(mockActiveColorHelper.setActiveColor).toHaveBeenCalledWith({
                categoryName: 'Test Color',
                categoryKey: 'testColor',
                color: {
                    categoryName: 'Test Color',
                    categoryKey: 'testColor',
                    clrA: '#aaa',
                    clrB: '#bbb'
                }
            });
        });

        it('correctly updates colors if they have been swapped', async () => {
            replicants.obsData = {
                gameplayInput: 'Capture!!'
            };
            replicants.swapColorsInternally = true;
            const testImage = Sharp();
            (obsConnectorService.getSourceScreenshot as jest.Mock).mockResolvedValue(testImage);
            (screenshotParserService.sampleTeamColors as jest.Mock).mockResolvedValue({
                categoryName: 'Test Color',
                categoryKey: 'testColor',
                clrA: '#aaa',
                clrB: '#bbb'
            });

            await controllerListeners.setActiveColorsFromGameplaySource();

            expect(obsConnectorService.getSourceScreenshot).toHaveBeenCalledWith('Capture!!');
            expect(screenshotParserService.sampleTeamColors).toHaveBeenCalledWith(testImage);
            expect(mockActiveColorHelper.setActiveColor).toHaveBeenCalledWith({
                categoryName: 'Test Color',
                categoryKey: 'testColor',
                color: {
                    categoryName: 'Test Color',
                    categoryKey: 'testColor',
                    clrA: '#bbb',
                    clrB: '#aaa'
                }
            });
        });
    });
});
