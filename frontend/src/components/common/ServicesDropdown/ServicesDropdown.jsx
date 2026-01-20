import React, { useState, useEffect } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CountryService from '../../../services/country/CountryService';
import './ServicesDropdown.css';

/**
 * Mega-menu style dropdown: Dịch vụ → Show continents in left panel, countries in right panel
 */
const ServicesDropdown = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [selectedContinent, setSelectedContinent] = useState(null);
    const [countriesByContinent, setCountriesByContinent] = useState({});
    const [loadingContinent, setLoadingContinent] = useState(null);

    // Continent configuration with Vietnamese names
    const continents = [
        { code: 'ASIA', name: 'Châu Á' },
        { code: 'EUROPE', name: 'Châu Âu' },
        { code: 'AFRICA', name: 'Châu Phi' },
        { code: 'NORTH_AMERICA', name: 'Bắc Mỹ' },
        { code: 'SOUTH_AMERICA', name: 'Nam Mỹ' },
        { code: 'AUSTRALIA', name: 'Châu Đại Dương' },
        { code: 'ANTARCTICA', name: 'Châu Nam Cực' }
    ];

    // Note: services removed — countries will navigate directly when clicked

    // Fetch countries for a continent when clicking/hovering
    const handleContinentClick = async (continentCode) => {
        setSelectedContinent(continentCode);

        // If already loaded, don't fetch again
        if (countriesByContinent[continentCode]) {
            return;
        }

        setLoadingContinent(continentCode);
        const countries = await CountryService.getCountriesByContinent(continentCode);
        setCountriesByContinent(prev => ({
            ...prev,
            [continentCode]: countries
        }));
        setLoadingContinent(null);
    };

    // When a country is clicked, navigate to find-mentor filtered by continent + country
    const handleCountrySelect = (countryCode) => {
        navigate(`/find-mentor?continent=${selectedContinent}&country=${countryCode}`);
        setShow(false);
    };

    return (
        <div className="services-dropdown-wrapper">
            <NavDropdown
                title="Dịch vụ"
                id="services-dropdown"
                className="services-dropdown mega-dropdown"
                show={show}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                renderMenuOnMount
            >
                <div className="mega-menu-container">
                    {/* Left Panel: Continents */}
                    <div className="continents-panel">
                        <div className="panel-header">
                            <h6 className="panel-title">Chọn châu lục</h6>
                        </div>
                        <div className="continents-list">
                            {continents.map((continent) => (
                                <div
                                    key={continent.code}
                                    className={`continent-item ${selectedContinent === continent.code ? 'active' : ''}`}
                                    onClick={() => handleContinentClick(continent.code)}
                                    onMouseEnter={() => handleContinentClick(continent.code)}
                                >
                                    <span className="continent-name">{continent.name}</span>
                                    <i className="bi bi-chevron-right ms-auto"></i>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Countries and Services */}
                    <div className="content-panel">
                        {selectedContinent ? (
                            <>
                                {loadingContinent === selectedContinent ? (
                                    <div className="loading-state">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Đang tải danh sách quốc gia...</p>
                                    </div>
                                ) : countriesByContinent[selectedContinent]?.length > 0 ? (
                                    <>
                                        <div className="panel-header">
                                            <h6 className="panel-title">Chọn quốc gia</h6>
                                        </div>
                                        <div className="countries-list">
                                            {countriesByContinent[selectedContinent].map((country) => (
                                                <div
                                                    key={country.id}
                                                    className={`country-card`}
                                                    onClick={() => handleCountrySelect(country.code)}
                                                >
                                                    {/* flag (if available) + name - compact */}
                                                    <div className="country-inline">
                                                        {country.flagUrl && (
                                                            <img
                                                                src={country.flagUrl}
                                                                alt={`${country.name} flag`}
                                                                className="country-flag"
                                                            />
                                                        )}
                                                        <span className="country-name">{country.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <i className="bi bi-globe2 text-muted" style={{ fontSize: '3rem' }}></i>
                                        <p className="mt-3 text-muted">Chưa có quốc gia nào trong châu lục này</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <i className="bi bi-hand-index text-muted" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3 text-muted">Vui lòng chọn châu lục bên trái</p>
                            </div>
                        )}
                    </div>
                </div>
            </NavDropdown>
        </div>
    );
};

export default ServicesDropdown;
