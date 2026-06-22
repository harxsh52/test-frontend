import { Grid, Skeleton, Stack } from '@mui/material';

const PageSkeleton = ({ cards = 3, rows = 4 }) => (
  <Stack spacing={3}>
    <Grid container spacing={2}>
      {Array.from({ length: cards }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={`card-${index}`}>
          <Skeleton variant="rounded" height={118} />
        </Grid>
      ))}
    </Grid>
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={`row-${index}`} variant="rounded" height={56} />
      ))}
    </Stack>
  </Stack>
);

export default PageSkeleton;
