import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { WonderShowcaseModal } from './components/wonders/WonderShowcaseModal';

function StandaloneShowcase() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-stone-950 via-stone-900 to-black flex items-center justify-center p-2 sm:p-4">
            <WonderShowcaseModal 
                isOpen={true} 
                initialWonderId="banpo_hut"
                onClose={() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.href = '/';
                    }
                }} 
            />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <StandaloneShowcase />
    </React.StrictMode>
);
