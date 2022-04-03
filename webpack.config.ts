// noinspection JSUnusedGlobalSymbols

import HtmlWebpackPlugin from 'html-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import nodeExternals from 'webpack-node-externals';
import * as globby from 'globby';
import * as path from 'path';
import webpack, { DefinePlugin } from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';

function dashboardConfig(): webpack.Configuration {
    function getEntries(patterns: string[]): { [key: string]: string } {
        return globby.sync(patterns, { cwd: 'src/dashboard' })
            .reduce((prev, curr) => {
                prev[path.basename(path.dirname(curr))] = `./${curr}`;
                return prev;
            }, {});
    }

    const entries = getEntries(['*/main.ts']);

    let plugins: any[] = [
        new VueLoaderPlugin(),
        ...Object.keys(entries).map((entryName) =>
            new HtmlWebpackPlugin({
                filename: `${entryName}.html`,
                chunks: [entryName],
                title: entryName,
                template: 'template.html'
            })
        ),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                extensions: {
                    vue: {
                        enabled: true,
                        compiler: '@vue/compiler-sfc'
                    }
                }
            }
        }),
        new DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(true),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(!isProd)
        }),
        ...(isProd ? [] : [
            new LiveReloadPlugin({
                port: 0,
                appendScriptTag: true
            })
        ])
    ];

    return {
        context: path.resolve(__dirname, 'src/dashboard'),
        mode: isProd ? 'production' : 'development',
        target: 'web',
        entry: {
            ...entries
        },
        output: {
            path: path.resolve(__dirname, 'dashboard'),
            filename: 'js/[name].js'
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json'],
            alias: {
                vue: 'vue/dist/vue.runtime.esm-bundler.js',
            },
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: 'tsconfig-browser.json'
                })
            ]
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                esModule: false
                            }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        appendTsSuffixTo: [/\.vue$/],
                        configFile: 'tsconfig-browser.json'
                    }
                }
            ]
        },
        plugins,
        optimization: (isProd) ? {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    common: {
                        minChunks: 2
                    },
                    defaultVendors: false,
                    default: false
                }
            }
        } : undefined
    };
}

const extensionConfig: webpack.Configuration = {
    entry: './src/extension/index.ts',
    resolve: {
        extensions: ['.js', '.ts', '.json'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: 'tsconfig-extension.json'
            })
        ]
    },
    output: {
        filename: 'index.js',
        path: path.join(__dirname, 'extension'),
        library: {
            type: 'commonjs2'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: '/node_modules',
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig-extension.json'
                }
            }
        ]
    },
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    externals: [nodeExternals()],
    externalsPresets: { node: true }
};

export default [
    dashboardConfig(),
    extensionConfig
];
