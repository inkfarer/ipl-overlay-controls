import { LocaleInfoService } from '../LocaleInfoService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { Locale } from 'types/enums/Locale';
import { GameVersion } from 'types/enums/gameVersion';
import { cartesian } from '../../../helpers/ArrayHelper';

describe('LocaleInfoService', () => {
    let localeInfoService: LocaleInfoService;

    beforeEach(() => {
        localeInfoService = new LocaleInfoService(mockNodecg);
    });

    describe('initLocaleInfo', () => {
        it('updates locale info if no locale info is present', () => {
            replicants.localeInfo = {
                modes: { },
                stages: { }
            };
            replicants.runtimeConfig = { locale: Locale.DE, gameVersion: GameVersion.SPLATOON_2 };

            localeInfoService.initLocaleInfo();

            expect(replicants.localeInfo).toEqual({
                modes: {
                    'Clam Blitz': 'Muschelchaos',
                    Rainmaker: 'Operation Goldfisch',
                    'Splat Zones': 'Herrschaft',
                    'Tower Control': 'Turmkommando',
                    'Turf War': 'Revierkampf',
                    'Unknown Mode': 'Unbekannte Kampfart'
                },
                stages: {
                    'Ancho-V Games': 'Anchobit Games HQ',
                    'Arowana Mall': 'Arowana Center',
                    'Blackbelly Skatepark': 'Punkasius-Skatepark',
                    'Camp Triggerfish': 'Camp Schützenfisch',
                    Counterpick: 'Counterpick',
                    'Goby Arena': 'Backfisch-Stadion',
                    'Humpback Pump Track': 'Buckelwal-Piste',
                    'Inkblot Art Academy': 'Perlmutt-Akademie',
                    'Kelp Dome': 'Tümmlerkuppel',
                    MakoMart: 'Cetacea-Markt',
                    'Manta Maria': 'Manta Maria',
                    'Moray Towers': 'Muränentürme',
                    'Musselforge Fitness': 'Molluskelbude',
                    'New Albacore Hotel': 'Hotel Neothun',
                    'Piranha Pit': 'Steinköhler-Grube',
                    'Port Mackerel': 'Heilbutt-Hafen',
                    'Shellendorf Institute': 'Abyssal-Museum',
                    'Shifty Station': 'Wandelzone',
                    'Skipper Pavilion': 'Grundel-Pavillon',
                    'Snapper Canal': 'Grätenkanal',
                    'Starfish Mainstage': 'Seeigel-Rockbühne',
                    'Sturgeon Shipyard': 'Störwerft',
                    'The Reef': 'Korallenviertel',
                    'Unknown Stage': 'Unbekannte Arena',
                    'Wahoo World': 'Flunder-Funpark',
                    'Walleye Warehouse': 'Kofferfisch-Lager',
                }
            });
        });
    });

    describe('updateLocaleInfo', () => {
        it.each(cartesian(Object.values(GameVersion), Object.values(Locale)))(
            'generates expected locale info when game version is %s and locale is %s',
            (gameVersion, locale) => {
                localeInfoService.updateLocaleInfo(locale, gameVersion);

                expect(replicants.localeInfo).toMatchSnapshot();
            });
    });
});
