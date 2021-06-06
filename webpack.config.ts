// noinspection JSUnusedGlobalSymbols

import HtmlWebpackPlugin from 'html-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import nodeExternals from 'webpack-node-externals';
import * as globby from 'globby';
import * as path from 'path';
import webpack from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';

function dashboardConfig(): webpack.Configuration {
    const entries: { [key: string]: string } = globby
        .sync(['*/main.js', '*/main.ts'], { cwd: 'src/dashboard' })
        .reduce((prev, curr) => {
            prev[path.basename(path.dirname(curr))] = `./${curr}`;
            return prev;
        }, {});

    let plugins = [];

    plugins = plugins.concat(
        [
            ...Object.keys(entries).map(
                (entryName) =>
                    new HtmlWebpackPlugin({
                        filename: `${entryName}.html`,
                        chunks: [entryName],
                        title: entryName,
                        template: `./${entryName}/${entryName}.html`
                    })
            )
        ]
    );

    if (!isProd) {
        plugins.push(
            new LiveReloadPlugin({
                port: 0,
                appendScriptTag: true
            })
        );
    }

    return {
        context: path.resolve(__dirname, 'src/dashboard'),
        mode: isProd ? 'production' : 'development',
        target: 'web',
        entry: entries,
        output: {
            path: path.resolve(__dirname, 'dashboard'),
            filename: 'js/[name].js'
        },
        resolve: {
            extensions: ['.js', '.ts', '.json'],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: 'tsconfig-browser.json'
                })
            ]
        },
        module: {
            rules: [
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
                    test: /\.js$/,
                    exclude: '/node_modules',
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.ts$/,
                    exclude: '/node_modules',
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [ '@babel/preset-env', '@babel/preset-typescript' ]
                        }
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
    entry: './src/extension/index.js',
    resolve: {
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
    mode: isProd ? 'production' : 'development',
    externals: [nodeExternals()],
    externalsPresets: { node: true }
}

export default [
    dashboardConfig(),
    extensionConfig
];
