import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
            <div className="bg-neutral text-white px-2 text-sm rounded rotate-12 absolute">
                Page Not Found
            </div>
            <p className="mt-4 text-lg text-text-secondary">
                Sorry, we couldn't find the page you're looking for.
            </p>
            <Link 
                to="/" 
                className="mt-6 inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-transform transform hover:-translate-y-1"
            >
                Go Home
            </Link>
        </div>
    );
};

export default NotFoundPage;