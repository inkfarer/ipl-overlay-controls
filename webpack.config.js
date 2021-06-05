const HtmlWebpackPlugin = require('html-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const globby = require('globby');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

function dashboardConfig() {
    // noinspection JSCheckFunctionSignatures
    const entries = globby
        .sync('*/main.js', { cwd: 'src/dashboard' })
        .reduce((prev, curr) => {
            prev[path.basename(path.dirname(curr))] = `./${curr}`;
            return prev;
        }, {});

    let plugins = [];

    if (!isProd) {
        plugins.push(
            new LiveReloadPlugin({
                port: 0,
                appendScriptTag: true
            })
        );
    }

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
            extensions: ['.js', '.ts', '.json']
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                esModule: false
                            }
                        }
                    ]
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

const extensionConfig = {
    entry: './src/extension/index.js',
    output: {
        filename: 'index.js',
        path: path.join(__dirname, 'extension'),
        library: {
            type: 'commonjs2'
        }
    },
    mode: isProd ? 'production' : 'development'
}

module.exports = [
    dashboardConfig(),
    extensionConfig
];
