import * as React from "react"
import { Link } from "gatsby"

const Pagination = ({ currentPage, numPages, basePath }) => {
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPage = currentPage - 1 === 1 ? basePath : `${basePath}page/${currentPage - 1}/`
    const nextPage = `${basePath}page/${currentPage + 1}/`

    if (numPages <= 1) return null

    return (
        <nav className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 sm:px-6 mt-8" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-zinc-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{numPages}</span>
                </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end gap-3">
                {!isFirst && (
                    <Link
                        to={prevPage}
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
                        rel="prev"
                    >
                        ← Previous
                    </Link>
                )}
                {!isLast && (
                    <Link
                        to={nextPage}
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
                        rel="next"
                    >
                        Next →
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Pagination
