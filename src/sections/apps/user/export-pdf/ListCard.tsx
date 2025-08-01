// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Page, View, Document, StyleSheet, Image, Text, Link } from '@react-pdf/renderer';

//project-imports
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { UserList } from 'types/user';

const textPrimary = '#262626';
const textSecondary = '#8c8c8c';
const border = '#f0f0f0';

const styles = StyleSheet.create({
  page: {
    padding: 30
  },
  container: {
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
    marginTop: 10,
    marginBottom: 10
  },
  card: {
    border: `1px solid ${border}`,
    marginBottom: '15px'
  },
  cardTitle: {
    fontSize: '12px',
    borderBottom: `1px solid ${border}`,
    padding: 15
  },
  cardContent: {
    padding: 15
  },
  about: {
    padding: 15,
    fontSize: '11px',
    color: textPrimary
  },
  IconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  IconRow: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5
  },
  icon: {
    width: 12,
    height: 10
  },
  iconTitle: {
    fontSize: 10,
    color: textPrimary
  },
  mainTitle: {
    fontSize: '11px',
    color: textSecondary
  },
  chip: {
    border: `1px solid ${textSecondary}`,
    alignItems: 'center',
    borderRadius: '4px',
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
  leftColumn: {
    paddingTop: '10px',
    width: '75%'
  },
  rightColumn: {
    paddingTop: '10px',
    width: '25%'
  },
  infoCard: {
    padding: 10
  },
  userDetails: {
    rowGap: 5,
    marginBottom: 15
  }
});

interface Props {
  user: UserList;
}

// ==============================|| USER - PREVIEW ||============================== //

export default function ListCard({ user }: Props) {
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
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <View style={styles.leftColumn}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>About me</Text>
                <Text style={[styles.about, styles.cardContent]}>Hello, {user.about}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Education</Text>
                <View style={styles.cardContent}>
                  <View style={styles.IconContainer}>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Master Degree (Year)</Text>
                      <Text style={styles.iconTitle}>2014-2017</Text>
                    </View>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Institute</Text>
                      <Text style={styles.iconTitle}>-</Text>
                    </View>
                  </View>
                  <View style={styles.hr} />
                  <View style={styles.IconContainer}>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Bachelor (Year)</Text>
                      <Text style={styles.iconTitle}>2011-2013</Text>
                    </View>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Institute</Text>
                      <Text style={styles.iconTitle}>Imperial College London</Text>
                    </View>
                  </View>
                  <View style={styles.hr} />
                  <View style={styles.IconContainer}>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>School (Year)</Text>
                      <Text style={styles.iconTitle}>2009-2011</Text>
                    </View>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Institute</Text>
                      <Text style={styles.iconTitle}>School of London, England</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Employment</Text>
                <View style={styles.cardContent}>
                  <View style={styles.IconContainer}>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Senior UI/UX designer (Year)</Text>
                      <Text style={styles.iconTitle}>2019-Current</Text>
                    </View>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Job Responsibility</Text>
                      <Text style={styles.iconTitle}>
                        Perform task related to project manager with the 100+ team under my observation. Team management is key role in this
                        company.
                      </Text>
                    </View>
                  </View>
                  <View style={styles.hr} />
                  <View style={styles.IconContainer}>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Trainee cum Project Manager (Year)</Text>
                      <Text style={styles.iconTitle}>2017-2019</Text>
                    </View>
                    <View style={[styles.row, styles.IconRow]}>
                      <Text style={styles.mainTitle}>Job Responsibility</Text>
                      <Text style={styles.iconTitle}>Team management is key role in this company.</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Skill</Text>
                <View style={styles.cardContent}>
                  <View style={[styles.row, { gap: 1, flexWrap: 'wrap' }]}>
                    {user.skills.map((skill: string, index: number) => (
                      <View style={styles.chip} key={index}>
                        <Text style={styles.chipTitle}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.rightColumn}>
              <View style={[styles.card, styles.infoCard]}>
                <View style={styles.userDetails}>
                  <Text style={styles.mainTitle}>Father Name</Text>
                  <Text style={styles.iconTitle}>
                    Mr. {user.firstName} {user.lastName}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.mainTitle}>Email</Text>
                  <Text style={styles.iconTitle}>{user.email}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.mainTitle}>Contact</Text>
                  <Text style={styles.iconTitle}>{user.contact}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.mainTitle}>Location</Text>
                  <Text style={styles.iconTitle}>{user.country}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.mainTitle}>Website</Text>
                  <Text style={styles.iconTitle}>
                    <Link
                      style={[styles.iconTitle, { color: theme.palette.primary.main }]}
                      src={`https://${user.firstName}.en`}
                    >{`https://${user.firstName}.en`}</Link>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
