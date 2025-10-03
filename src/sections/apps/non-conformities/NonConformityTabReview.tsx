import React from 'react';
import { 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Box,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DocumentDownload, Printer, TickCircle } from 'iconsax-react';

interface Props {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  nonConformityId?: number;
  onPrintPdf?: () => void;
}

export default function NonConformityTabReview({ values, setFieldValue, nonConformityId, onPrintPdf }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handlePrintNonConformity = () => {
    if (onPrintPdf && nonConformityId) {
      onPrintPdf();
    } else {
      console.log('No se puede imprimir: No hay ID o función de impresión disponible');
    }
  };

  const handlePrintFiveWhys = () => {
    console.log('Imprimir 5 Porqués');
    // Aquí iría la lógica de impresión de 5 porqués
  };

  const handleCloseNonConformity = () => {
    console.log('Cerrar No Conformidad');
    // Aquí iría la lógica de cierre
  };

  return (
    <Grid container spacing={3}>
      
      {/* Botones de acción */}
      <Grid size={12}>
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          mb: 3,
          justifyContent: isMobile ? 'center' : 'flex-start',
          flexWrap: 'wrap'
        }}>
          {isMobile ? (
            // Versión móvil: Botones tipo globo con solo iconos
            <>
              <Tooltip title="Imprimir No Conformidad" placement="top">
                <IconButton
                  onClick={handlePrintNonConformity}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Printer size={20} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Imprimir 5 Porqués" placement="top">
                <IconButton
                  onClick={handlePrintFiveWhys}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <DocumentDownload size={20} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Cerrar No Conformidad" placement="top">
                <IconButton
                  onClick={handleCloseNonConformity}
                  sx={{ 
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                    '&:hover': { 
                      bgcolor: 'success.dark'
                    }
                  }}
                >
                  <TickCircle size={20} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            // Versión desktop: Botones con texto e iconos
            <>
              <Button
                variant="outlined"
                startIcon={<Printer />}
                onClick={handlePrintNonConformity}
              >
                Imprimir No Conformidad
              </Button>
              <Button
                variant="outlined"
                startIcon={<DocumentDownload />}
                onClick={handlePrintFiveWhys}
              >
                Imprimir 5 Porqués
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<TickCircle />}
                onClick={handleCloseNonConformity}
              >
                Cerrar No Conformidad
              </Button>
            </>
          )}
        </Box>
      </Grid>

      {/* 1. Motivos y Clasificación */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            1. Motivos y Clasificación
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography><strong>Número:</strong> {values.number || 'Sin asignar'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Clasificación:</strong> {values.classification || 'Sin clasificar'}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography><strong>Descripción:</strong> {values.description || 'Sin descripción'}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography><strong>Hallazgo:</strong> {values.findingDescription || 'Sin hallazgo'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Área/Proceso:</strong> {values.areaOrProcess || 'Sin especificar'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Detectado en:</strong> {values.detectedAt || 'Sin fecha'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Válido desde:</strong> {values.validFrom || 'Sin fecha'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Válido hasta:</strong> {values.validTo || 'Sin fecha'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* 2. Causa y Plan de Acción */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            2. Causa y Plan de Acción
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography><strong>Causa:</strong> {values.cause || 'Sin definir'}</Typography>
          {values.actionPlans && values.actionPlans.length > 0 ? (
            values.actionPlans.map((plan: any, index: number) => (
              <Box key={plan.id} sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2">Plan #{index + 1}</Typography>
                  <Chip 
                    label={plan.type === 'principal' ? 'Principal' : 'Secundaria'} 
                    color={plan.type === 'principal' ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography><strong>Descripción:</strong> {plan.description}</Typography>
                <Typography><strong>Fecha Compromiso:</strong> {plan.commitmentDate}</Typography>
                <Typography><strong>Responsables:</strong> {plan.responsibles?.map((r: any) => r.label).join(', ') || 'Sin asignar'}</Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No hay planes de acción definidos</Typography>
          )}
        </Paper>
      </Grid>

      {/* 3. Seguimientos y Análisis de Efectividad */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            3. Seguimientos y Análisis de Efectividad
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {values.followUps && values.followUps.length > 0 ? (
            values.followUps.map((followUp: any, index: number) => (
              <Box key={followUp.id} sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Seguimiento #{index + 1}</Typography>
                <Typography><strong>Fecha:</strong> {followUp.date}</Typography>
                <Typography><strong>Verificado por:</strong> {followUp.verifiedBy?.label || followUp.verifiedByOther || 'Sin asignar'}</Typography>
                <Typography><strong>Justificación:</strong> {followUp.justification}</Typography>
                <Typography><strong>¿Fue efectiva?</strong> {followUp.wasEffective ? 'Sí' : 'No'}</Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No hay seguimientos registrados</Typography>
          )}
        </Paper>
      </Grid>

      {/* 4. Análisis de 5 Porqués */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            4. Análisis de 5 Porqués
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography><strong>Referencia:</strong> {values.number || 'Sin asignar'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Clasificación:</strong> {values.classification || 'Sin clasificar'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Fecha:</strong> {values.fiveWhysDate || 'Sin fecha'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography><strong>Participantes:</strong> {values.fiveWhysParticipants?.map((p: any) => p.label).join(', ') || 'Sin participantes'}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography><strong>Casos similares:</strong> {values.hasSimilarCases ? 'Sí' : 'No'}</Typography>
              {values.hasSimilarCases && values.similarCasesDetails && (
                <Typography sx={{ mt: 1, ml: 2 }}><em>{values.similarCasesDetails}</em></Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* 5. ¿Por qué tuvimos el problema? */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            5. ¿Por qué tuvimos el problema?
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map((num) => (
            <Typography key={num} sx={{ mb: 1 }}>
              <strong>{num}. ¿Por qué?</strong> {values[`whyProblem${num}`] || 'Sin respuesta'}
            </Typography>
          ))}
        </Paper>
      </Grid>

      {/* 6. ¿Por qué el problema no fue detectado? */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            6. ¿Por qué el problema no fue detectado?
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map((num) => (
            <Typography key={num} sx={{ mb: 1 }}>
              <strong>{num}. ¿Por qué?</strong> {values[`whyNotDetected${num}`] || 'Sin respuesta'}
            </Typography>
          ))}
        </Paper>
      </Grid>

      {/* 7. Determinación de la(s) causa(s) Raíz */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            7. Determinación de la(s) causa(s) Raíz
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {values.rootCauseDetermination ? (
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
              {values.rootCauseDetermination}
            </Typography>
          ) : (
            <Typography color="text.secondary">Sin determinación de causa raíz</Typography>
          )}
        </Paper>
      </Grid>

      {/* Archivos adjuntos */}
      <Grid size={12}>
        <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Archivos Adjuntos
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <input type="file" onChange={(e) => setFieldValue('attachment', e.target.files?.[0] ?? null)} />
          {values.attachment && values.attachment instanceof File && (
            <Typography sx={{ mt: 1 }}>
              <strong>Archivo:</strong> {values.attachment.name}
            </Typography>
          )}
          {!values.attachment && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>Sin archivos adjuntos</Typography>
          )}
        </Paper>
      </Grid>

    </Grid>
  );
}
