import React, { FC, memo, useMemo } from 'react';
import Slider from 'react-slick';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { useGetBanners } from 'api/banners';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Banner = {
  id: string | number;
  title?: string;
  description?: string;
  link?: string;
  linkName?: string;
  imagePath?: string;
  imageFileName?: string;
  imagePreviewUrl?: string;
  oneDriveFileId?: string;
  imageBase64?: string;
  active?: boolean;
  order?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  banners?: Banner[];
  height?: number | string;
};

const defaultBanners: Banner[] = [
  {
    id: '1',
    title: 'Bienvenido a Conecta CCI',
    description: 'Nuevas actualizaciones disponibles',
    imagePath: '/assets/analytics/analytics-1.png',
    link: '/apps/dashboard',
    active: true,
    order: 1
  },
  {
    id: '2',
    title: 'Reportes',
    description: 'Genera reportes y exporta en segundos',
    imagePath: '/assets/analytics/analytics-2.png',
    link: '/apps/reports',
    active: true,
    order: 2
  }
];

const BannersSlider: FC<Props> = ({ banners = defaultBanners, height = 220 }) => {
  const { banners: apiBanners = [] } = useGetBanners();

  const visibleBanners = useMemo(() => {
    const source = apiBanners && apiBanners.length > 0 ? apiBanners : banners;
    return (source || [])
      .filter((b: Banner) => Boolean(b && (b.active === true || b.status === 'active')))
      .sort((a: Banner, b: Banner) => Number(a.order ?? 0) - Number(b.order ?? 0));
  }, [apiBanners]);

  const settings = {
    dots: true,
    arrows: true,
    infinite: visibleBanners.length > 1 ? true : false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    adaptiveHeight: false
  } as any;

  return (
    <MainCard content={false} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Slider {...settings}>
          {(() => {
            const slides: JSX.Element[] = [];
            visibleBanners.filter(Boolean).forEach((b: Banner) => {
              // Determina si es una URL de OneDrive o una ruta local
              const isOneDriveImage = !!b.imagePreviewUrl;
              const apiBaseUrl = import.meta.env.VITE_APP_API_URL || '';
              // const oneDriveUrl = `http://localhost:3006/onedrive/file/${b.oneDriveFileId}/content`;
              const oneDriveUrl = `${apiBaseUrl}/onedrive/file/${b.oneDriveFileId}/content`;
              const imageUrl = isOneDriveImage ? oneDriveUrl : b.imagePath;
              slides.push(
                <Box
                  key={b.id}
                  sx={{
                    position: 'relative',
                    height,
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  {isOneDriveImage ? (
                    b.link ? (
                      <a href={b.link} target="_blank" rel="noopener noreferrer" aria-label={b.linkName || ''} title={b.linkName || ''}>
                        <img
                          src={imageUrl}
                          alt={b.title || 'Banner'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover', // Simula background-size: cover
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                      </a>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={b.title || 'Banner'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover', // Simula background-size: cover
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    )
                  ) : b.link ? (
                    <a href={b.link} target="_blank" rel="noopener noreferrer" aria-label={b.linkName || ''}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    </a>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  )}

                  {/* El contenido superpuesto se mantiene sin cambios */}
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      color: '#fff',
                      textAlign: 'left',
                      p: 4,
                      maxWidth: 400
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 1 }}>
                      {b.title}
                    </Typography>
                    {b.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {b.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            });
            return slides;
          })()}
        </Slider>
      </Box>
    </MainCard>
  );
};

export default memo(BannersSlider);
