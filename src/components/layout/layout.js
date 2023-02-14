import * as React from "react"
import {Link} from "gatsby"
import {Container} from "./container";

const Layout = ({location, title, children}) => {
    const rootPath = `${__PATH_PREFIX__}/`
    // const isRootPath = location.pathname === rootPath

    return (
        <div className="bg-zinc-50">
            <div className="bg-zinc-50 fixed inset-0 flex justify-center sm:px-8">
                <div className="flex w-full max-w-7xl lg:px-8">
                    <div className="w-full bg-white ring-1 ring-zinc-100"/>
                </div>
            </div>
            <div className="relative">
                <Container className="mt-16 sm:mt-32">
                    <header className="max-w-2xl">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl">
                            <Link to="/">{title}</Link>
                        </h1>
                        {/*<p className="mt-6 text-base text-zinc-600">*/}
                        {/*    {intro}*/}
                        {/*</p>*/}
                    </header>
                    <div className="mt-16 sm:mt-20">{children}</div>
                </Container>
            </div>
            <footer>
                <a rel="me" href="https://masto.ai/@timothybroder">Mastodon</a>
            </footer>
        </div>

    )
}

export default Layout
