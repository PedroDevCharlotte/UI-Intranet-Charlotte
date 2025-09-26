import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Grid from '@mui/material/Grid2';
import { Stack, Typography, RadioGroup, FormControlLabel, Radio, Button, Box } from '@mui/material';
import { openSnackbar } from 'api/snackbar';
import { sendTicketFeedback, getTicketFeedback } from 'api/ticket';
import { useEffect } from 'react';

type RatingValue = 0 | 1 | 2 | 3;

export default function TicketFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [knowledge, setKnowledge] = useState<RatingValue | null>(null);
  const [timing, setTiming] = useState<RatingValue | null>(null);
  const [escalation, setEscalation] = useState<RatingValue | null>(null);
  const [resolved, setResolved] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');

  const isValid = () => {
    return knowledge !== null && timing !== null && escalation !== null && resolved !== null;
  };

  useEffect(() => {
    // check if feedback already exists for this ticket; if so notify and redirect
    (async () => {
      if (!id) return;
      try {
        const resp = await getTicketFeedback(id);
        if (resp?.exists) {
          openSnackbar({
            open: true,
            message: 'La encuesta para este ticket ya fue respondida.',
            variant: 'alert',
            alert: { color: 'info' }
          } as any);
          navigate('/apps/ticket/list');
        }
      } catch (err) {
        // if 404 or other, ignore and allow to continue; otherwise log
        console.error('Error checking ticket feedback existence', err);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!isValid()) {
      openSnackbar({ open: true, message: 'Por favor responde todas las preguntas.', variant: 'alert', alert: { color: 'error' } } as any);
      return;
    }

    const payload = {
      ticketId: id ?? null,
      knowledge,
      timing,
      escalation,
      resolved,
      comment
    };

    try {
      await sendTicketFeedback(payload);
      openSnackbar({ open: true, message: 'Gracias por tu retroalimentación', variant: 'alert', alert: { color: 'success' } } as any);
      // redirigir a lista de tickets
      navigate('/apps/ticket/list');
    } catch (err) {
      console.error('Feedback submission error', err);
      openSnackbar({
        open: true,
        message: 'Ocurrió un error al enviar la retroalimentación',
        variant: 'alert',
        alert: { color: 'error' }
      } as any);
    }
  };

  return (
    <MainCard title={`Encuesta - Ticket #${id}`}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1">¿Cómo evalúa el grado de conocimiento y experiencia en la atención de este caso?</Typography>
              <RadioGroup value={String(knowledge ?? '')} onChange={(e) => setKnowledge(Number(e.target.value) as RatingValue)}>
                <FormControlLabel value="3" control={<Radio />} label="Muy Bueno" />
                <FormControlLabel value="2" control={<Radio />} label="Bueno" />
                <FormControlLabel value="1" control={<Radio />} label="Regular" />
                <FormControlLabel value="0" control={<Radio />} label="Malo" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography variant="subtitle1">¿Cómo evalúa el tiempo de atención para este caso?</Typography>
              <RadioGroup value={String(timing ?? '')} onChange={(e) => setTiming(Number(e.target.value) as RatingValue)}>
                <FormControlLabel value="3" control={<Radio />} label="Muy Bueno" />
                <FormControlLabel value="2" control={<Radio />} label="Bueno" />
                <FormControlLabel value="1" control={<Radio />} label="Regular" />
                <FormControlLabel value="0" control={<Radio />} label="Malo" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography variant="subtitle1">
                ¿Considera que los problemas fueron tratados y/o escalados correctamente según su complejidad y especialidad técnica
                necesaria?
              </Typography>
              <RadioGroup value={String(escalation ?? '')} onChange={(e) => setEscalation(Number(e.target.value) as RatingValue)}>
                <FormControlLabel value="3" control={<Radio />} label="Muy Bueno" />
                <FormControlLabel value="2" control={<Radio />} label="Bueno" />
                <FormControlLabel value="1" control={<Radio />} label="Regular" />
                <FormControlLabel value="0" control={<Radio />} label="Malo" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography variant="subtitle1">En términos generales ¿El caso fue resuelto?</Typography>
              <RadioGroup value={String(resolved ?? '')} onChange={(e) => setResolved(Number(e.target.value))}>
                <FormControlLabel value="1" control={<Radio />} label="Si" />
                <FormControlLabel value="0" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Enviar
              </Button>
              <Button variant="outlined" onClick={() => navigate('/apps/ticket/list')}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
