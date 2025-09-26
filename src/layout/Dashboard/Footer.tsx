// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ==============================|| MAIN LAYOUT - FOOTER ||============================== //

export default function Footer() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant="caption">&copy; ConectaCCI crafted with ♥ by Our Team </Typography>
      <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* <Link component={RouterLink} to="https://ableproadmin.com" target="_blank" variant="caption" color="text.primary">
          Home
        </Link>
        <Link component={RouterLink} to="https://phoenixcoded.gitbook.io/able-pro" target="_blank" variant="caption" color="text.primary">
          Documentation
        </Link>
        <Link component={RouterLink} to="https://phoenixcoded.authordesk.app/" target="_blank" variant="caption" color="text.primary">
          Support
        </Link> */}
      </Stack>
    </Stack>
  );
}
