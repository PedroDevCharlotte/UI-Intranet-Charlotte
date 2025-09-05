
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

// project imports
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import { updateUser } from 'api/user';
import { showAlert } from 'api/snackbar';

export default function TabEmoji() {
	const auth = useAuth();
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// simple avatar options
	const [eyeSize, setEyeSize] = useState(50);
	const [mouthSize, setMouthSize] = useState(50);
	const [skinTone, setSkinTone] = useState('#f1c27d');
	const [topType, setTopType] = useState<string>('shortHairShortFlat');
	const [hairColor, setHairColor] = useState<string>('brown');
	const [eyeType, setEyeType] = useState<string>('default');
	const [mouthType, setMouthType] = useState<string>('smile');

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [streamActive, setStreamActive] = useState(false);

	const [dicebearSvg, setDicebearSvg] = useState<string | null>(null);
	const [dicebearElements, setDicebearElements] = useState<Record<string, string>>({});

	useEffect(() => {
		return () => {
			if (videoRef.current && videoRef.current.srcObject) {
				const s = videoRef.current.srcObject as MediaStream;
				s.getTracks().forEach((t) => t.stop());
			}
		};
	}, []);

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] || null;
		setFile(f);
		if (f) setPreview(URL.createObjectURL(f));
	};

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
				setStreamActive(true);
			}
		} catch (err) {
			console.error(err);
			showAlert('No se puede acceder a la cámara', 'error');
		}
	};

	const takePhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;
		const video = videoRef.current;
		const canvas = canvasRef.current;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const data = canvas.toDataURL('image/png');
		setPreview(data);
		const s = video.srcObject as MediaStream;
		s.getTracks().forEach((t) => t.stop());
		setStreamActive(false);
		setFile(null);
	};

	const buildAvatarPayload = async () => {
		let baseImage = preview;
		if (!baseImage && file) {
			baseImage = await new Promise<string>((res, rej) => {
				const fr = new FileReader();
				fr.onload = () => res(String(fr.result));
				fr.onerror = rej;
				fr.readAsDataURL(file as Blob);
			});
		}
		if (!baseImage) return null;
		return JSON.stringify({ baseImage, config: { eyeSize, mouthSize, skinTone, topType, hairColor, eyeType, mouthType } });
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			const payload = await buildAvatarPayload();
			if (!payload) {
				showAlert('No hay imagen para generar el avatar', 'warning');
				setLoading(false);
				return;
			}

			const userIdStr = auth?.user?.id;
			const userId = userIdStr ? Number(userIdStr) : NaN;
			if (!userId || Number.isNaN(userId)) {
				showAlert('Usuario no autenticado', 'error');
				setLoading(false);
				return;
			}

			const result = await updateUser(userId, { avatar: payload } as any);
			if (result && (result as any).success) {
				showAlert('Avatar guardado en tu perfil', 'success');
			} else {
				showAlert('Error guardando avatar', 'error');
			}
		} catch (err) {
			console.error(err);
			showAlert('Error al guardar avatar', 'error');
		} finally {
			setLoading(false);
		}
	};

	// DiceBear generation (v6)
	const generateWithDicebear = () => {
		try {
			const style = Object.values(avataaars)[0];
			if (!createAvatar || !style) {
				showAlert('DiceBear no está disponible. Instala @dicebear/core y una colección (ej. @dicebear/avataaars).', 'warning');
				return;
			}

			// Usa un string como semilla para el avatar
			const seed = [topType, hairColor, eyeType, mouthType, skinTone, eyeSize, mouthSize].join('-');
			const svg = createAvatar(style, { seed }).toString();
			setDicebearSvg(svg);

			const elSamples: Record<string, string> = {};
			for (const [k, v] of Object.entries({ topType, hairColor, eyeType, mouthType, skinTone, eyeSize, mouthSize })) {
				const s = `${k}:${String(v)}`;
				try {
					const ssvg = createAvatar(style, { seed: s }).toString();
					elSamples[k] = ssvg;
				} catch (err) {
					// ignore
				}
			}
			setDicebearElements(elSamples);
		} catch (err) {
			console.error(err);
			showAlert('No se pudo generar con DiceBear: falta la dependencia o ocurrió un error.', 'error');
		}
	};

	return (
		<Grid container spacing={3}>
			<Grid size={12}>
				<MainCard title="Personaliza tu avatar">
					<Stack spacing={2}>
						<Typography variant="body2">Toma una foto con la cámara o sube una. Ajusta rasgos simples y guarda como avatar.</Typography>
						<input type="file" accept="image/*" onChange={onFileChange} />
						<div>
							<Button variant="outlined" onClick={startCamera} disabled={streamActive}>Abrir cámara</Button>
							<Button variant="contained" onClick={takePhoto} disabled={!streamActive}>Tomar foto</Button>
						</div>
						<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
							<video ref={videoRef} style={{ width: 240, height: 180, display: streamActive ? 'block' : 'none', borderRadius: 8 }} />
							<canvas ref={canvasRef} style={{ display: 'none' }} />
							{preview && <img src={preview} alt="preview" style={{ maxWidth: 200, borderRadius: 8 }} />}
						</div>

									<Typography variant="subtitle2">Ajustes rápidos</Typography>
						<div>
										<Typography variant="caption">Tamaño de ojos (afecta la vista previa)</Typography>
							<Slider value={eyeSize} min={10} max={100} onChange={(_, v) => setEyeSize(v as number)} />
										<Typography variant="caption">Tamaño de boca (afecta la vista previa)</Typography>
							<Slider value={mouthSize} min={10} max={100} onChange={(_, v) => setMouthSize(v as number)} />
							<Typography variant="caption">Tono de piel</Typography>
							<input type="color" value={skinTone} onChange={(e) => setSkinTone(e.target.value)} />
										<InputLabel sx={{ mt: 1 }}>Peinado</InputLabel>
							<Select value={topType} onChange={(e) => setTopType(e.target.value as string)} fullWidth>
											<MenuItem value="shortHairShortFlat">Corto liso</MenuItem>
											<MenuItem value="shortHairShortCurly">Corto rizado</MenuItem>
											<MenuItem value="longHairStraight">Largo liso</MenuItem>
											<MenuItem value="longHairCurly">Largo rizado</MenuItem>
											<MenuItem value="hijab">Hijab</MenuItem>
											<MenuItem value="noHair">Sin cabello</MenuItem>
							</Select>

										<InputLabel sx={{ mt: 1 }}>Color de cabello</InputLabel>
							<Select value={hairColor} onChange={(e) => setHairColor(e.target.value as string)} fullWidth>
											<MenuItem value="black">Negro</MenuItem>
											<MenuItem value="brown">Castaño</MenuItem>
											<MenuItem value="blonde">Rubio</MenuItem>
											<MenuItem value="red">Rojo</MenuItem>
											<MenuItem value="gray">Gris</MenuItem>
							</Select>

										<InputLabel sx={{ mt: 1 }}>Tipo de ojos</InputLabel>
							<Select value={eyeType} onChange={(e) => setEyeType(e.target.value as string)} fullWidth>
											<MenuItem value="default">Predeterminado</MenuItem>
											<MenuItem value="happy">Feliz</MenuItem>
											<MenuItem value="squint">Entrecerrados</MenuItem>
											<MenuItem value="wink">Guiño</MenuItem>
											<MenuItem value="close">Cerrados</MenuItem>
							</Select>

										<InputLabel sx={{ mt: 1 }}>Tipo de boca</InputLabel>
							<Select value={mouthType} onChange={(e) => setMouthType(e.target.value as string)} fullWidth>
											<MenuItem value="smile">Sonrisa</MenuItem>
											<MenuItem value="twinkle">Ligera</MenuItem>
											<MenuItem value="serious">Serio</MenuItem>
											<MenuItem value="neutral">Neutral</MenuItem>
											<MenuItem value="smileOpen">Sonrisa abierta</MenuItem>
							</Select>
						</div>

						<Stack direction="row" spacing={2}>
							<Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar avatar'}</Button>
											<Button variant="outlined" onClick={() => { setFile(null); setPreview(null); setEyeSize(50); setMouthSize(50); setSkinTone('#f1c27d'); }}>
												Restablecer
											</Button>
							<Button variant="outlined" onClick={generateWithDicebear}>Generar con DiceBear</Button>
						</Stack>
					</Stack>
				</MainCard>
			</Grid>

			<Grid size={12}>
				<MainCard title="Vista previa DiceBear">
					<Stack spacing={2}>
						{dicebearSvg ? (
							<div style={{ border: '1px solid #eee', padding: 8, borderRadius: 8 }} dangerouslySetInnerHTML={{ __html: dicebearSvg }} />
						) : (
							<Typography variant="body2">No hay SVG generado. Haz click en "Generar con DiceBear".</Typography>
						)}

						{Object.keys(dicebearElements).length > 0 && (
							<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
								{Object.entries(dicebearElements).map(([k, svg]) => (
									<div key={k} style={{ width: 120, textAlign: 'center' }}>
										<div style={{ width: 120, height: 120, border: '1px solid #eee', padding: 6, borderRadius: 6 }} dangerouslySetInnerHTML={{ __html: svg }} />
										<Typography variant="caption">{k}</Typography>
									</div>
								))}
							</div>
						)}
					</Stack>
				</MainCard>
			</Grid>
		</Grid>
	);
}
