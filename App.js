import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const PRODUCTS_URL =
  'https://dummyjson.com/products/category/sports-accessories';

const PRODUCT_TEXT = {
  137: {
    name: 'Amerikan Futbolu Topu',
    description: 'Amerikan futbolunda pas ve yakalama çalışmaları için oval top.',
  },
  138: {
    name: 'Beyzbol Topu',
    description: 'Beyzbol oyununda atış ve vuruş çalışmaları için kullanılan top.',
  },
  139: {
    name: 'Beyzbol Eldiveni',
    description: 'Beyzbol topunu yakalamak için kullanılan oyuncu eldiveni.',
  },
  140: {
    name: 'Basketbol Topu',
    description: 'Basketbol maçlarında ve antrenmanlarında kullanılan top.',
  },
  141: {
    name: 'Basketbol Çemberi',
    description: 'Basketbol potasının atış yapılan çemberi.',
  },
  142: {
    name: 'Kriket Topu',
    description: 'Krikette atış ve vuruş çalışmaları için kullanılan top.',
  },
  143: {
    name: 'Kriket Sopası',
    description: 'Kriket topuna vurmak için kullanılan düz yüzeyli sopa.',
  },
  144: {
    name: 'Kriket Kaskı',
    description: 'Kriket oyuncuları için baş koruyucu kask.',
  },
  145: {
    name: 'Kriket Kale Direkleri',
    description: 'Krikette kaleyi oluşturan direkler.',
  },
  146: {
    name: 'Tüylü Badminton Topu',
    description: 'Badminton oyununda raketle vurulan tüylü top.',
  },
  147: {
    name: 'Futbol Topu',
    description: 'Futbol maçlarında ve antrenmanlarında kullanılan top.',
  },
  148: {
    name: 'Golf Topu',
    description: 'Golf oyununda ve vuruş çalışmalarında kullanılan top.',
  },
  149: {
    name: 'Demir Golf Sopası',
    description: 'Golfte farklı mesafelerde vuruş yapmak için kullanılan demir sopa.',
  },
  150: {
    name: 'Metal Beyzbol Sopası',
    description: 'Beyzbol vuruşları için kullanılan metal sopa.',
  },
  151: {
    name: 'Tenis Topu',
    description: 'Tenis maçlarında ve antrenmanlarında kullanılan top.',
  },
  152: {
    name: 'Tenis Raketi',
    description: 'Tenis topuna vurmak için kullanılan raket.',
  },
  153: {
    name: 'Voleybol Topu',
    description: 'Voleybol maçlarında ve antrenmanlarında kullanılan top.',
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function productName(product) {
  return PRODUCT_TEXT[product.id]?.name ?? 'Spor malzemesi';
}

function formatPrice(price) {
  return `${price.toFixed(2).replace('.', ',')} $`;
}

function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(PRODUCTS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API hatası: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data.products);
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const searchTerm = search.trim().toLocaleLowerCase('tr-TR');
  const filteredProducts = products.filter((product) =>
    productName(product).toLocaleLowerCase('tr-TR').includes(searchTerm)
  );

  return (
    <View style={styles.screen}>
      <TextInput
        placeholder="Ürün ara..."
        placeholderTextColor="#697386"
        accessibilityLabel="Ürün ara"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.message}>Ürünler yüklenemedi.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.message}>Ürün bulunamadı.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Detay', { product: item })}
              style={styles.card}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.info}>
                <Text style={styles.title}>{productName(item)}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function SavedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.message}>Henüz kayıt yok.</Text>
    </View>
  );
}

function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const description =
    PRODUCT_TEXT[product.id]?.description ?? 'Türkçe açıklama hazırlanıyor.';
  const discount = product.discountPercentage ?? 0;
  const discountedPrice = product.price * (1 - discount / 100);
  const photos = product.images?.length
    ? product.images
    : [product.thumbnail].filter(Boolean);
  const reviews = product.reviews ?? [];

  return (
    <ScrollView style={styles.detailScreen} contentContainerStyle={styles.detailContent}>
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={styles.detailImage}
              resizeMode="contain"
              accessibilityLabel={`${productName(product)} görseli ${index + 1}`}
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.detailTitle}>{productName(product)}</Text>

      {discount > 0 && (
        <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
      )}
      <Text style={styles.detailPrice}>{formatPrice(discountedPrice)}</Text>

      {Number.isFinite(product.stock) && product.stock < 10 && (
        <Text style={styles.stockBadge}>
          {product.stock === 0 ? 'Stokta yok' : `Son ${product.stock} ürün`}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Ürün bilgileri</Text>
      <Text style={styles.bodyText}>{description}</Text>
      <Text style={styles.bodyText}>Marka: {product.brand || 'Belirtilmemiş'}</Text>
      <Text style={styles.bodyText}>
        Puan: {product.rating?.toLocaleString('tr-TR') ?? 'Belirtilmemiş'} / 5
      </Text>
      <Text style={styles.bodyText}>
        Stok: {Number.isFinite(product.stock) ? `${product.stock} adet` : 'Belirtilmemiş'}
      </Text>

      <Text style={styles.sectionTitle}>Müşteri değerlendirmeleri</Text>
      {reviews.length === 0 && (
        <Text style={styles.bodyText}>Henüz değerlendirme yok.</Text>
      )}
      {reviews.map((review, index) => (
        <View key={index} style={styles.review}>
          <Text style={styles.title}>★ {review.rating} / 5</Text>
          {review.date && (
            <Text style={styles.bodyText}>
              {new Date(review.date).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Ürünler"
        component={ProductsScreen}
        options={{ title: 'Spor Malzemeleri', tabBarLabel: 'Ürünler' }}
      />
      <Tab.Screen name="Kaydedilenler" component={SavedScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="AnaSekmeler"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detay"
          component={ProductDetailScreen}
          options={({ navigation }) => ({
            title: 'Ürün Detayı',
            headerBackVisible: false,
            headerLeft: ({ tintColor }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Spor Malzemeleri ekranına dön"
                onPress={() => navigation.goBack()}
                hitSlop={8}
              >
                <Text style={{ color: tintColor ?? '#2457A6', fontSize: 15 }}>
                  ‹ Spor Malzemeleri
                </Text>
              </Pressable>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#172033',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  image: {
    width: 72,
    height: 72,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    color: '#2457A6',
    fontWeight: '600',
    marginTop: 6,
  },
  message: {
    textAlign: 'center',
    marginTop: 16,
  },
  detailScreen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  detailContent: {
    padding: 16,
    paddingBottom: 32,
  },
  detailImage: {
    width: 260,
    height: 210,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  oldPrice: {
    color: '#596476',
    textDecorationLine: 'line-through',
  },
  detailPrice: {
    color: '#2457A6',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0D8',
    color: '#7A3800',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#364152',
    marginBottom: 4,
  },
  review: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
});