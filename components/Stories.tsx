import { STORIES } from '@/constants/mack-data';
import { styles } from '@/styles/feed.style';
import { ScrollView } from 'react-native';
import Store from './Story';


const StoriesSection = () => {
  return(
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
      {STORIES.map((story) => (
        <Store key={story.id} story={story}/>
      ))}
    </ScrollView> 
  );
}; 

export default StoriesSection;