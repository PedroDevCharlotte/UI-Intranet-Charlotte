// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Page, View, Document, StyleSheet, Image, Text, Link } from '@react-pdf/renderer';

// project-imports
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { UserList } from 'types/user';

// assets
import LinkIcon from 'assets/images/icons/link.png';
import Mail from 'assets/images/icons/mail.png';
import Maps from 'assets/images/icons/map.png';
import Phone from 'assets/images/icons/phone.png';

const textPrimary = '#262626';
const textSecondary = '#8c8c8c';
const border = '#f0f0f0';

const styles = StyleSheet.create({
  page: {
    padding: 30
  },
  container: {
    border: `1px solid ${border}`,
    padding: 18,
    flexDirection: 'column',
    '@media max-width: 400': {
      flexDirection: 'column'
    }
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    objectFit: 'cover'
  },
  CardInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: 14,
    lineHeight: 1.57,
    color: textPrimary
  },
  role: {
    fontSize: 10,
    lineHeight: 1.66,
    color: textSecondary
  },
  hr: {
    borderBottom: `1px solid ${border}`,
    paddingTop: 18
    // paddingBottom: 18
  },
  about: {
    paddingTop: 18,
    fontSize: 14,
    lineHeight: 1.57,
    fontWeight: 'demibold',
    color: textPrimary,
    paddingBottom: 18
  },
  IconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  IconRow: {
    width: '48%',
    gap: 10,
    paddingBottom: 10
  },
  icon: {
    width: 12,
    height: 10
  },
  iconTitle: {
    fontSize: 10,
    lineHeight: 1.57,
    color: textSecondary
  },
  chip: {
    border: `1px solid ${textSecondary}`,
    alignItems: 'center',
    borderRadius: '4px',
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 8
  },
  chipTitle: {
    color: textSecondary,
    fontSize: '10px',
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    paddingTop: 4
  },
  timer: {
    marginTop: 25
  }
});

interface Props {
  user: UserList;
}

// ==============================|| USER - CARD ||============================== //

export default function ListSmallCard({ user }: Props) {
  const theme = useTheme();

  return (
    <Document title={`${user?.fatherName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.row}>
            <Image style={styles.image} src={getImageUrl(`avatar-${!user.avatar ? 1 : user.avatar}.png`, ImagePath.USERS)} />
            <View style={styles.CardInfo}>
              <Text style={styles.title}>{user.fatherName}</Text>
              <Text style={styles.role}>{user.role}</Text>
            </View>
          </View>
          <View style={styles.hr} />
          <View>
            <Text style={styles.about}>Hello, {user.about}</Text>
          </View>
          <View style={styles.IconContainer}>
            <View style={[styles.row, styles.IconRow]}>
              <Image src={Mail} style={styles.icon} />
              <Text style={styles.iconTitle}>{user.email}</Text>
            </View>
            <View style={[styles.row, styles.IconRow]}>
              <Image src={Maps} style={styles.icon} />
              <Text style={styles.iconTitle}>{user.country}</Text>
            </View>
          </View>
          <View style={styles.IconContainer}>
            <View style={[styles.row, styles.IconRow]}>
              <Image src={Phone} style={styles.icon} />
              <Text style={styles.iconTitle}>{user.contact}</Text>
            </View>
            <View style={[styles.row, styles.IconRow]}>
              <Image src={LinkIcon} style={styles.icon} />
              <Link
                style={[styles.iconTitle, { color: theme.palette.primary.main }]}
                src={`https://${user.firstName}.en`}
              >{`https://${user.firstName}.en`}</Link>
            </View>
          </View>
          <View style={[styles.row, { gap: 1, paddingTop: 18 }]}>
            {user.skills.map((skill: string, index: number) => (
              <View style={styles.chip} key={index}>
                <Text style={styles.chipTitle}>{skill}</Text>
              </View>
            ))}
          </View>
          <View style={styles.timer}>
            <Text style={styles.iconTitle}> Updated in {user.time}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
