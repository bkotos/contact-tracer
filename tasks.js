const child_process = require('child_process')
const esbuild = require('esbuild')
const path = require('path')

const run = async (command, args = [], options = {}) =>
    new Promise(
        (resolve) => {
            console.log(` > ${command} ${args.join(' ')}`)
            child_process.spawn(command, args, {stdio: 'inherit', ...options})
                .on('close', () => resolve())
        }
    )

const copy = async () => {
    const copyRecursive = async (from, to) => {
        await run('mkdir', ['-p', to])
        await run('cp', ['-r', from, to])
    }

    await copyRecursive('node_modules/@blueprintjs/icons/lib/css/', 'public/vendor/blueprintjs/icons/lib/css/')
    await copyRecursive('node_modules/@blueprintjs/icons/resources/icons/', 'public/vendor/blueprintjs/icons/resources/icons/')
    await copyRecursive('node_modules/@blueprintjs/core/lib/css/', 'public/vendor/blueprintjs/core/lib/css/')
    await copyRecursive('node_modules/@blueprintjs/datetime/lib/css/', 'public/vendor/blueprintjs/datetime/lib/css/')
    await run('cp', ['LICENSE', 'public/LICENSE'])
}

const clean = async () =>
    await run('rm', ['-rf', 'public/vendor', 'public/dist', 'public/.git', 'public/LICENSE'])

const serve = async (stdio = 'inherit') => await run('serve', ['public'], {stdio})

const getEsbuildOptions = (environment) => ({
    bundle: true,
    minify: true,
    sourcemap: true,
    entryPoints: [path.resolve(process.cwd(), 'src/index.tsx')],
    outfile: path.resolve(process.cwd(), 'public/dist/index.js'),
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    define: {
        'process.env.NODE_ENV': `"${environment}"`,
        'process.env.BLUEPRINT_NAMESPACE': 'null',
        'process.env.REACT_APP_BLUEPRINT_NAMESPACE': 'null',
        'global.Symbol': 'Symbol',
    }
})

const buildDev = () => esbuild.buildSync(getEsbuildOptions('development'))

const buildProd = () => esbuild.buildSync(getEsbuildOptions('production'))

const deploy = async () => {
    const cwd = 'dist'
    await run('git', ['init'], { cwd })
    await run(
        'git',
        [
            'remote',
            'add',
            'origin',
            'git@github.com:bkotos/contact-tracer.git'
        ],
        { cwd }
    )
    await run('git', ['fetch', 'origin'], { cwd })
    await run('git', ['checkout', '-tb', 'gh-pages', 'origin/gh-pages'], { cwd })

    await clean()
    await copy()
    buildProd()

    await run('git', ['status'], { cwd })
    await run('git', ['add', '-A'], { cwd })
    await run('git', ['status'], { cwd })
    await run('git', ['commit', '-m', 'deploy'], { cwd })
    await run('git', ['push', 'origin', 'gh-pages'], { cwd })
    await run('rm', ['-rf', '.git'], { cwd })
}

const watch = async(stdio = 'inherit') =>
    await run('chokidar', [
        '"src/**/*.ts"',
        '"src/**/*.tsx"',
        '-c',
        '"node tasks.js build:dev"',
    ], {stdio})

const start = async() =>
    await Promise.all([
        watch('ignore'),
        serve('ignore')
    ])

const app = (process, command) => {
    const subCommands = []
    const subCommandMap = {}

    const subCommand = (subCommand, fx, description) => {
        subCommands.push({ subCommand, fx, description })
        subCommandMap[subCommand] = { subCommand, fx, description }
        return chain
    }

    const run = async () => {
        subCommand('help', help, 'List commands and their descriptions.')
        let hasMatches = false
        for (const subCommandName of process.argv) {
            if (subCommandName in subCommandMap) {
                const { subCommand, fx } = subCommandMap[subCommandName]
                await fx()
                hasMatches = true
            }
        }

        // for (let i = 0; i < subCommands.length; i++) {
        //     const { subCommand, fx } = subCommands[i]
        //     if (process.argv.includes(subCommand)) {
        //         await fx()
        //         hasMatches = true
        //     }
        // }

        // const hasMatches = subCommands.filter(({ subCommand, fx }) => {
        //     const match = process.argv.includes(subCommand)
        //     if (match) fx()
        //     return match
        // }).length > 0
        if (!hasMatches) help()
    }

    const help = () =>
        subCommands.forEach(({ subCommand, fx, description }) => console.log(
            `${command} ${subCommand}\n    ${description}\n`
        ))

    const chain = { subCommand, run }

    return chain
}

app(process, 'node tasks.js')
    .subCommand('copy', copy, 'Copy vendor assets to public directory.')
    .subCommand('clean', clean, 'Clean.')
    .subCommand('serve', serve, 'Serve web app.')
    .subCommand('build:dev', buildDev, 'Build web app (development).')
    .subCommand('deploy', deploy, 'Build web app (production).')
    .subCommand('watch', watch, 'Watch source code and re-compile changes.')
    .subCommand('start', start, 'Watch for changes and serve web app.')
    .run()
