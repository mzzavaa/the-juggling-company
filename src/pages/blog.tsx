// pages/blog.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

// Define the Post interface for TypeScript
interface Post {
  title: string;
  date: string;
  slug: string;
}

// Define the component, specifying that it receives an array of posts
export default function Blog({ posts }: { posts: Post[] }) {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Blog
      </Typography>
      <List>
        {posts.map((post) => (
          <ListItem key={post.slug} button component={Link} href={`/blog/${post.slug}`}>
            <ListItemText primary={post.title} secondary={post.date} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

// Use getStaticProps to fetch the list of blog posts
export const getStaticProps = async () => {
  const files = fs.readdirSync(path.join('content/blog'));

  const posts: Post[] = files.map((filename) => {
    const filePath = path.join('content/blog', filename);
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(markdownWithMeta);

    return {
      title: frontmatter.title,
      date: frontmatter.date,
      slug: filename.replace('.md', ''),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
