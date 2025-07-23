import { useEffect, useMemo, useState } from 'react';

// material-ui
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import FormUserAdd from './FormUserAdd';
import { handlerUserDialog, useGetUser, useGetUserMaster } from 'api/user';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { UserList } from 'types/user';

// ==============================|| USER - ADD / EDIT ||============================== //

export default function AddUser() {
  const { userMasterLoading, userMaster } = useGetUserMaster();
  const { usersLoading: loading, users } = useGetUser();
  const isModal = userMaster?.modal;

  const [list, setList] = useState<UserList | null>(null);

  useEffect(() => {
    if (userMaster?.modal && typeof userMaster.modal === 'number') {
      const newList = users.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMaster]);

  const closeModal = () => handlerUserDialog(false);

  const userForm = useMemo(
    () => !loading && !userMasterLoading && <FormUserAdd user={list} closeModal={closeModal} />,
    [list, loading, userMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
          onClose={closeModal}
          aria-labelledby="modal-user-add-label"
          aria-describedby="modal-user-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ minWidth: { xs: 320, sm: 600, md: 768 }, maxWidth: 768, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {loading && userMasterLoading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center' }}>
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                userForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
