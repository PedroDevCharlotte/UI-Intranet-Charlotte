import { useState, useEffect, ChangeEvent } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import EmptyUserCard from 'components/cards/skeleton/EmptyUserCard';
import { DebouncedInput } from 'components/third-party/react-table';
import UserCard from 'sections/apps/user/UserCard';
import UserModal from 'sections/apps/user/UserModal';

import { useGetUser } from 'api/user';
import { GRID_COMMON_SPACING } from 'config';
import usePagination from 'hooks/usePagination';

// types
import { UserList } from 'types/user';

// assets
import { Add, SearchNormal1 } from 'iconsax-react';

// constant
const allColumns = [
  {
    id: 1,
    header: 'Default'
  },
  {
    id: 2,
    header: 'User Name'
  },
  {
    id: 3,
    header: 'Email'
  },
  {
    id: 4,
    header: 'Contact'
  },
  {
    id: 5,
    header: 'Age'
  },
  {
    id: 6,
    header: 'Country'
  },
  {
    id: 7,
    header: 'Status'
  }
];

function dataSort(data: UserList[], sortBy: string) {
  return data.sort(function (a: any, b: any) {
    if (sortBy === 'User Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Email') return a.email.localeCompare(b.email);
    if (sortBy === 'Contact') return a.contact.localeCompare(b.contact);
    if (sortBy === 'Age') return b.age < a.age ? 1 : -1;
    if (sortBy === 'Country') return a.country.localeCompare(b.country);
    if (sortBy === 'Status') return a.status.localeCompare(b.status);
    return a;
  });
}

// ==============================|| USER - CARD ||============================== //

export default function UserCardPage() {
  const { users: lists } = useGetUser();

  const [sortBy, setSortBy] = useState('Default');
  const [globalFilter, setGlobalFilter] = useState('');
  const [userCard, setUserCard] = useState<UserList[]>([]);
  const [page, setPage] = useState(1);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userModal, setUserModal] = useState<boolean>(false);

  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as string);
  };

  // search
  useEffect(() => {
    setUserLoading(true);
    if (lists && lists.length > 0) {
      const newData = lists.filter((value: any) => {
        if (globalFilter) {
          return value.name.toLowerCase().includes(globalFilter.toLowerCase());
        } else {
          return value;
        }
      });
      setUserCard(dataSort(newData, sortBy).reverse());
      setUserLoading(false);
    }
  }, [globalFilter, lists, sortBy]);

  const PER_PAGE = 6;

  const count = Math.ceil(userCard.length / PER_PAGE);
  const _DATA = usePagination(userCard, PER_PAGE);

  const handleChangePage = (e: ChangeEvent<unknown>, p: number) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <>
      <Box sx={{ position: 'relative', marginBottom: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onFilterChange={(value) => setGlobalFilter(String(value))}
              placeholder={`Search ${userCard.length} records...`}
              startAdornment={<SearchNormal1 size={18} />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, alignItems: 'center' }}>
              <FormControl sx={{ m: '8px !important', minWidth: 120 }}>
                <Select
                  value={sortBy}
                  onChange={handleChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography variant="subtitle1">Sort By</Typography>;
                    }

                    return <Typography variant="subtitle2">Sort by ({sortBy})</Typography>;
                  }}
                >
                  {allColumns.map((column) => {
                    return (
                      <MenuItem key={column.id} value={column.header}>
                        {column.header}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => setUserModal(true)} size="large" startIcon={<Add />}>
                Add User
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ ...(!(!userLoading && userCard.length > 0) && { justifyContent: 'center' }) }}>
        {!userLoading && userCard.length > 0 ? (
          _DATA.currentData().map((user: UserList, index: number) => (
            <Slide key={index} direction="up" in={true} timeout={50}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <UserCard user={user} />
              </Grid>
            </Slide>
          ))
        ) : (
          <EmptyUserCard title={userLoading ? 'Loading...' : 'You have not created any user yet.'} />
        )}
      </Grid>
      <Stack sx={{ gap: 2, alignItems: 'flex-end', p: 2.5 }}>
        <Pagination
          sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
          count={count}
          size="medium"
          page={page}
          showFirstButton
          showLastButton
          variant="combined"
          color="primary"
          onChange={handleChangePage}
        />
      </Stack>
      <UserModal open={userModal} modalToggler={setUserModal} />
    </>
  );
}
