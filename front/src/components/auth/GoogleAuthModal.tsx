'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface GoogleAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { businessName: string; service: string }) => void;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const t = useTranslations('Auth');
    const [businessName, setBusinessName] = useState('');
    const [service, setService] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!businessName.trim()) {
            setError(t('businessNameRequired') || 'Business name is required');
            return;
        }
        if (!service) {
            setError(t('requiredField') || 'Service is required');
            return;
        }
        onConfirm({ businessName, service });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-coffee-100 flex justify-between items-center bg-coffee-50/30">
                    <h3 className="text-xl font-semibold text-coffee-800">{t('completeProfile')}</h3>
                    <button onClick={onClose} className="text-coffee-400 hover:text-coffee-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-coffee-700">{t('businessName')}</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => {
                                setBusinessName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder={t('businessPlaceholder')}
                            className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 transition-all ${error && !businessName ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-coffee-700">{t('serviceRequired')}</label>
                        <div className="relative">
                            <select
                                value={service}
                                onChange={(e) => {
                                    setService(e.target.value);
                                    if (error) setError('');
                                }}
                                className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 transition-all appearance-none cursor-pointer ${error && !service ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
                            >
                                <option value="" disabled>{t('selectService')}</option>
                                <option value="photographer">{t('photographer')}</option>
                                <option value="makeupArtist">{t('makeupArtist')}</option>
                                <option value="client">{t('client')}</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-coffee-500 font-bold">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                </div>

                <div className="p-6 bg-coffee-50/30 border-t border-coffee-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 py-3 px-4 font-medium rounded-xl border border-coffee-200 text-coffee-600 hover:bg-white hover:text-coffee-800 transition-all duration-200"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="cursor-pointer flex-1 py-3 px-4 font-semibold rounded-xl bg-coffee-800 text-white hover:bg-coffee-700 shadow-lg shadow-coffee-800/20 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthModal;
