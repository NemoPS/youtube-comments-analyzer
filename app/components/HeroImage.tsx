import React from 'react';

const HeroImage: React.FC = () => {
    return (
        <div className="w-full md:w-1/2">
            <div className="relative mx-auto max-w-md perspective">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-xl opacity-50 animate-pulse"></div>
                <img
                    src="/hero_img.jpg"
                    alt="Hero"
                    className="relative w-full aspect-video md:aspect-square rounded-xl object-cover shadow-2xl transform transition-all duration-1000 hover:scale-105 animate-float perspective-image"
                />
            </div>
        </div>
    );
};

export default HeroImage;