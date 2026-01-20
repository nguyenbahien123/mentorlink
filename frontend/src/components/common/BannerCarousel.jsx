import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { instance } from '../../api/axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './BannerCarousel.css';

const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        let mounted = true;

        const fetchBanners = async () => {
            console.log('BannerCarousel: fetching banners from /api/banners/top5');
            try {
                const payload = await instance.get('/api/banners/top5');
                console.log('BannerCarousel: api payload ->', payload);
                // instance is configured to return response.data, which usually contains { data: [...] }
                let items = [];
                if (!payload) {
                    items = [];
                } else if (Array.isArray(payload)) {
                    items = payload;
                } else if (Array.isArray(payload.data)) {
                    items = payload.data;
                } else if (Array.isArray(payload.result)) {
                    items = payload.result;
                }

                if (mounted) setBanners(items);
            } catch (err) {
                console.error('Failed to fetch banners', err);
            }
        };

        fetchBanners();

        return () => { mounted = false; };
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1000,
        arrows: true,
        pauseOnHover: true,
        adaptiveHeight: true,
    };

    if (!banners || banners.length === 0) return null;

    return (
        <div className="banner-carousel my-4">
            <Slider {...settings}>
                {banners.map((b) => (
                    <div key={b.bannerId || b.id || b.title} className="banner-slide">
                        <a href={b.linkUrl || '#'} className="d-block">
                            <img
                                src={b.imageUrl || b.image || ''}
                                alt={b.title || 'Banner'}
                                className="banner-img"
                            />
                        </a>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default BannerCarousel;
