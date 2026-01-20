import React from 'react';
import { useTheme } from '../../../contexts';
import { Button } from 'react-bootstrap';
import '../../../styles/components/ThemeToggle.css';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        null
    );
};

export default ThemeToggle;